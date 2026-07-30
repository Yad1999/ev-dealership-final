
# Vehicle API Documentation

Base Path: `/vehicle`

---

## 1. Get Vehicle by ID
Retrieves details of a specific vehicle model by its ID.

* **HTTP Method:** `GET`
* **URL:** `/vehicle/{vehicleId}`
* **Path Variables:**
  * `vehicleId` (int): The ID of the vehicle model.
* **Response:** Returns an `Optional<VehicleModel>` object containing the vehicle details if found, or empty if not found.

---

## 2. Save Analytics Event
Records user interaction events (such as clicking into a vehicle) along with the client's IP address and current date.

* **HTTP Method:** `POST`
* **URL:** `/vehicle/saveEvent`
* **Request Body (JSON):** 
  ```json
  {
      "eventType": "Clicked into vehicle",
      "vehicleModel": {
          "id": 2
      }
  }



-   **Response:**
    
    -   Returns the success/status message from `vehicleService.saveEvent`.
        
    -   Returns `"could not save event"` if an exception occurs during saving.
        

## 3. Search Vehicles

Searches and filters vehicles in the database using optional query parameters. If no parameters are provided, all vehicles are returned.

-   **HTTP Method:** `GET`
    
-   **URL:** `/vehicle/search`
    
-   **Request Parameters (`@RequestParam` - optional):**
    
    -   `keyword` (String): Searches the brand, model, and year fields for matching text.
        
    -   `onSale` (Boolean): If set to `true`, filters the results to only include vehicles that are on sale.
        
    -   `sortByPrice` (String): Sorts the results by price (`asc` for ascending, `desc` for descending).
        
-   **Response:** Returns a `List<VehicleModel>` matching the specified search and filter criteria.
    

## 4. Get Vehicle Reviews

Retrieves all customer reviews and ratings for a specific vehicle model. Called when loading a vehicle's detail page.

-   **HTTP Method:** `GET`
    
-   **URL:** `/vehicle/reviews/{vehicleId}`
    
-   **Path Variables:**
    
    -   `vehicleId` (Integer): The ID of the vehicle model.
        
-   **Response:** Returns a `List<VehicleReview>` containing the reviews for the vehicle.
    

## 5. Get Vehicle Inventory

Retrieves all inventory units available for a specific vehicle model. _Note: Since all inventory items are returned, ensure users are only allowed to add inventory items to their cart where `isAvailable` is true._

-   **HTTP Method:** `GET`
    
-   **URL:** `/vehicle/inventory/{vehicleId}`
    
-   **Path Variables:**
    
    -   `vehicleId` (Integer): The ID of the vehicle model.
        
-   **Response:** Returns a `List<VehicleInventory>` representing the inventory associated with the vehicle model.
    

## 6. Get Vehicle Custom Parts

Retrieves the list of customizable parts available for a specific vehicle model. Called when loading a vehicle's detail page.

-   **HTTP Method:** `GET`
    
-   **URL:** `/vehicle/parts/{vehicleId}`
    
-   **Path Variables:**
    
    -   `vehicleId` (Integer): The ID of the vehicle model.
        
-   **Response:** Returns a `List<VehicleCustomPart>` containing the available custom parts for the vehicle.
