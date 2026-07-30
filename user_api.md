# User API Documentation

Base Path: `/user`

## 1. User Sign Up

Registers a new user and automatically initializes an empty shopping cart for them upon successful creation.
-   **HTTP Method:** `POST`

-   **URL:** `/user/signup`
    
-   **Request Body (JSON):** Requires `email`, `password`, and `username`.
    
    JSON
    
    ```
    {
        "username": "johndoe",
        "email": "john@example.com",
        "password": "securePassword123"
    }
    
    ```
    
-   **Response:**
    
    -   Returns `"success"` (or the result message from `userService.addUser`) if registration and cart creation succeed.
        
    -   Returns `"There was an issue creating the cart"` if user creation succeeded but cart initialization failed.
        

## 2. User Login

Authenticates an existing user based on their credentials.

-   **HTTP Method:** `POST`
    
-   **URL:** `/user/login`
    
-   **Request Body (JSON):** Requires `username` and `password`.
    
    JSON
    
    ```
    {
        "username": "johndoe",
        "password": "securePassword123"
    }
    
    ```
    
-   **Response:** Returns an `Optional<User>` object containing user details if authentication is successful, or empty if it fails.
    

## 3. Add Vehicle to Cart

Adds a customized vehicle with specific configuration parts to a user's shopping cart. _Note: The `cartId` in the path corresponds to the user's ID._

-   **HTTP Method:** `POST`
    
-   **URL:** `/user/addToCart/{cartId}`
    
-   **Path Variables:**
    
    -   `cartId` (Integer): The ID of the user's cart (same as the user ID).
        
-   **Request Body (JSON):**
    
    JSON
    
    ```
    {
        "vehicleInventory": {
            "vin": "1111111111"
        },
        "vehicleCustomParts": [
            {
                "id": 13
            },
            {
                "id": 14
            }
        ]
    }
    
    ```
    
-   **Response:**
    
    -   Returns a success message from `cartService.addtoCart` upon successful addition.
        
    -   Returns `"Could not get the users cart"` if the cart cannot be found.
        
    -   Returns an error message if the vehicle inventory doesn't exist or if `isAvailable()` evaluates to false (`"The item trying to be added is not available"`).
        

## 4. Get User Cart

Retrieves the contents and details of a user's shopping cart.

-   **HTTP Method:** `GET`
    
-   **URL:** `/user/getCart/{cartId}`
    
-   **Path Variables:**
    
    -   `cartId` (Integer): The ID of the user's cart.
        
-   **Response:** Returns the `Cart` object if found, or `null` if an exception occurs or the cart does not exist.
    

## 5. Remove Vehicle From Cart

Removes a specific customized vehicle from the cart using its customized vehicle ID.

-   **HTTP Method:** `DELETE`
    
-   **URL:** `/user/removeVehicleFromCart/{vehicleId}`
    
-   **Path Variables:**
    
    -   `vehicleId` (Integer): The ID of the customized vehicle in the cart (not the vehicle model ID).
        
-   **Response:**
    
    -   Returns the success/status message from `cartService.removeFromCart`.
        
    -   Returns `"there was an issue getting the customized vehicle for deletion"` if the customized vehicle cannot be located.
        

## 6. Create Vehicle Review

Allows a user to submit a star rating and review text for a specific vehicle model.

-   **HTTP Method:** `POST`
    
-   **URL:** `/user/createReview/{userId}/{vehicleId}`
    
-   **Path Variables:**
    
    -   `userId` (Integer): The ID of the user writing the review.
        
    -   `vehicleId` (Integer): The ID of the vehicle model being reviewed.
        
-   **Request Body (JSON):**
    
    JSON
    
    ```
    {
        "reviewText": "This is a review for the vehicle",
        "starRating": 5
    }
    
    ```
    
-   **Validation Rules:**
    
    -   `reviewText` must not be empty.
        
    -   `starRating` must be an integer between `1` and `5` inclusively.
        
-   **Response:**
    
    -   Returns success message from `userService.addReview`.
        
    -   Returns validation/error messages if text is missing, ratings are out of bounds, or if the user/vehicle cannot be found.
        

## 7. Create Order (Checkout)

Converts all items currently in the user's shopping cart into a formal order.

-   **HTTP Method:** `POST`
    
-   **URL:** `/user/createOrder`
    
-   **Request Body (JSON):** Requires delivery address details, customer name, payment method, final price (rounded to two decimal places), and the user ID.
    
    JSON
    
    ```
    {
        "address": {
            "street": "40 Bay Street",
            "city": "Toronto",
            "province": "Ontario",
            "country": "Canada",
            "zip": "M5J 3A5",
            "phone": "416-555-5555"
        },
        "fname": "John",
        "lname": "Doe",
        "finalPrice": 10000.00, 
        "paymentMethod": "Debit", 
        "user": {
            "id": 12
        }
    }
    
    ```
    
-   **Response:**
    
    -   Automatically sets the order status to `"In Progress"` and processes the order.
        
    -   Returns `"Could not get cart details"` if the user's cart cannot be retrieved.
        
    -   Returns `"There are no items in the cart to purchase"` if the cart is empty or null.
        

## 8. Get User Orders

Retrieves a list of all historical and active orders placed by a specific user.

-   **HTTP Method:** `GET`
    
-   **URL:** `/user/orders/{userId}`
    
-   **Path Variables:**
    
    -   `userId` (Integer): The ID of the user whose orders are being retrieved.
        
-   **Response:** Returns a `List<UserOrder>` containing the user's orders, or `null` if an error occurs.
