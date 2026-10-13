
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
import time
import uuid

driver = webdriver.Chrome()
wait = WebDriverWait(driver, 20)
passed = 0

try:
    # Open website
    driver.get("http://localhost:3000")
    driver.maximize_window()

    # LOGIN
    username = wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, "//input[@ng-model='loginData.username']")
        )
    )
    password = driver.find_element(
        By.XPATH, "//input[@ng-model='loginData.password']"
    )

    username.send_keys("admin")
    password.send_keys("admin123")

    driver.find_element(
        By.XPATH, "//form[@ng-submit='login()']//button[@type='submit']"
    ).click()

    # Wait for the book form after login
    title_field = wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, "//input[@ng-model='book.title']")
        )
    )

    # TEST 1: Book form is visible
    assert driver.find_element(
        By.XPATH, "//input[@ng-model='book.author']"
    ).is_displayed()

    assert driver.find_element(
        By.XPATH, "//input[@ng-model='book.category']"
    ).is_displayed()

    assert driver.find_element(
        By.XPATH, "//select[@ng-model='book.status']"
    ).is_displayed()

    passed += 1
    print("TEST CASE 1 PASSED: Book form is visible")

    # TEST 2: Add an Available book
    book1 = "Selenium Book " + uuid.uuid4().hex[:6]

    title_field.send_keys(book1)
    driver.find_element(
        By.XPATH, "//input[@ng-model='book.author']"
    ).send_keys("Test Author")

    driver.find_element(
        By.XPATH, "//input[@ng-model='book.category']"
    ).send_keys("Computer Science")

    Select(driver.find_element(
        By.XPATH, "//select[@ng-model='book.status']"
    )).select_by_visible_text("Available")

    driver.find_element(
        By.XPATH, "//form[@ng-submit='saveBook()']//button[@type='submit']"
    ).click()

    wait.until(
        EC.text_to_be_present_in_element(
            (By.TAG_NAME, "body"), book1
        )
    )

    passed += 1
    print("TEST CASE 2 PASSED: Available book added")

    # TEST 3: Refresh page and verify book persists
    driver.refresh()

    wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, "//input[@ng-model='loginData.username']")
        )
    )

    driver.find_element(
        By.XPATH, "//input[@ng-model='loginData.username']"
    ).send_keys("admin")

    driver.find_element(
        By.XPATH, "//input[@ng-model='loginData.password']"
    ).send_keys("admin123")

    driver.find_element(
        By.XPATH, "//form[@ng-submit='login()']//button[@type='submit']"
    ).click()

    wait.until(
        EC.text_to_be_present_in_element(
            (By.TAG_NAME, "body"), book1
        )
    )

    passed += 1
    print("TEST CASE 3 PASSED: Book remains after page refresh")

    # TEST 4: Add an Issued book
    book2 = "Issued Book " + uuid.uuid4().hex[:6]

    wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, "//input[@ng-model='book.title']")
        )
    ).send_keys(book2)

    driver.find_element(
        By.XPATH, "//input[@ng-model='book.author']"
    ).send_keys("Second Author")

    driver.find_element(
        By.XPATH, "//input[@ng-model='book.category']"
    ).send_keys("Technology")

    Select(driver.find_element(
        By.XPATH, "//select[@ng-model='book.status']"
    )).select_by_visible_text("Issued")

    driver.find_element(
        By.XPATH, "//form[@ng-submit='saveBook()']//button[@type='submit']"
    ).click()

    wait.until(
        EC.text_to_be_present_in_element(
            (By.TAG_NAME, "body"), book2
        )
    )

    passed += 1
    print("TEST CASE 4 PASSED: Issued book added")

except Exception as error:
    print("\nTEST FAILED:", repr(error))
    print("Passed before failure:", passed, "out of 4")

finally:
    print(f"\nTEST SUMMARY: {passed}/4 test cases passed")

    if passed == 4:
        print("ALL 4 TEST CASES PASSED SUCCESSFULLY")

    time.sleep(3)
    driver.quit()