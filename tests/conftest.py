import pytest
import time
import pathlib
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager

# --- Configuration (Update as needed) ---

# 🚨 CRITICAL: UPDATE THIS URL to match where your ToDo app is running
BASE_APP_URL = "http://localhost:3000"

# 🚨 CRITICAL: UPDATE THESE CREDENTIALS for a valid test user
TEST_CREDENTIALS = {
    "username": "abc@gmail.com",
    "password": "abcdefg"
}

# 🚨 CRITICAL: Update this if your username in the database differs from the email prefix
# This should match the 'name' field in your database for the test user
TEST_USERNAME = "abc"  # Update this to match your test user's actual name in the database

# --- Fixture Definitions ---

@pytest.fixture(scope="session")
def base_url():
    """Returns the base URL of the ToDo application under test."""
    return BASE_APP_URL

@pytest.fixture
def driver(request):
    """Initializes and quits the Chrome WebDriver, handles maximizing the window, 
    and saves a screenshot upon test failure."""
    
    # Setup: Initialize WebDriver
    options = Options()
    options.add_argument("--start-maximized")
    # Installs or retrieves the correct ChromeDriver executable
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
    # Yield: Execution continues to the test function
    yield driver
    
    # Teardown: Cleanup and Error Capture
    # Check if the test failed and if the driver session is active
    if hasattr(request.node, "rep_call") and request.node.rep_call.failed:
        path = pathlib.Path("screenshots")
        path.mkdir(exist_ok=True)
        
        # Ensure driver is still running before attempting to capture screenshot
        if driver.session_id:
            file_name = path / f"{request.node.name}-{int(time.time())}.png"
            driver.save_screenshot(str(file_name))
            print(f"\nCaptured failure screenshot: {file_name}")
            
    # Always close the browser
    driver.quit()

@pytest.fixture
def logged_in_driver(driver, base_url):
    """
    Uses the base 'driver' fixture to start the browser, navigates to the app,
    performs a login, and then yields the logged-in driver instance.
    """
    wait = WebDriverWait(driver, 10)
    
    try:
        driver.get(f"{base_url}/login")

        # 1. Locate and enter email
        email_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
        email_input.send_keys(TEST_CREDENTIALS["username"])

        # 2. Locate and enter password
        password_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='password']")))
        password_input.send_keys(TEST_CREDENTIALS["password"])
        
        # 3. Locate and click the login button
        login_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button.auth-btn[type='submit']")))
        login_button.click()
        
        # 4. Wait for the successful transition to the ToDo page (will auto-navigate to /main/{name})
        #    First wait for navigation to complete
        time.sleep(3)  # Allow time for redirect after login
        
        # Wait for the task input field which is visible on the main page
        try:
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input.task-input")))
        except:
            # If we're not on the main page yet, try to navigate manually
            driver.get(f"{base_url}/main/{TEST_USERNAME}")
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input.task-input")))
        
    except Exception as e:
        # If login fails during setup, report the failure immediately
        pytest.fail(f"Fixture Setup Failed: Login was unsuccessful. Check the URL, credentials, and selectors. Error: {e}")

    # Yield the driver, which is now logged in and on the main page
    yield driver


@pytest.fixture
def main_page_url(base_url):
    """
    Returns the main page URL for the test user.
    
    Uses TEST_USERNAME configuration which should match the 'name' field 
    in your database for the test user.
    """
    return f"{base_url}/main/{TEST_USERNAME}"
    
# --- Custom Pytest Hook (required for screenshot logic) ---

@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """
    Pytest internal hook wrapper to capture test results and attach them to the test item.
    This enables the 'driver' fixture to check for failure status (rep_call.failed) 
    in its teardown phase.
    """
    # Execute the original hook to get the result
    outcome = yield
    
    # Get the detailed report object
    rep = outcome.get_result()
    
    # Store the report on the test item
    setattr(item, "rep_" + rep.when, rep)
    
    # Must return the report object
    return rep
