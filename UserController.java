package com.eecs4413.evsystem.controller;


import java.util.List;
import java.util.Optional;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eecs4413.evsystem.models.Cart;
import com.eecs4413.evsystem.models.CustomizedVehicle;
import com.eecs4413.evsystem.models.User;
import com.eecs4413.evsystem.models.UserOrder;
import com.eecs4413.evsystem.models.VehicleInventory;
import com.eecs4413.evsystem.models.VehicleModel;
import com.eecs4413.evsystem.models.VehicleReview;
import com.eecs4413.evsystem.service.CartService;
import com.eecs4413.evsystem.service.UserService;
import com.eecs4413.evsystem.service.VehicleService;





@RestController
@RequestMapping("/user")
public class UserController{

    private final VehicleService vehicleService;
    private final UserService userService;
    private final CartService cartService;

    UserController(VehicleService vehicleService, CartService cartService, UserService userService) {
        this.vehicleService = vehicleService;
        this.cartService = cartService;
        this.userService = userService;
    }

    /*
    Only email, password, and username needed for the user json body
    */
    @PostMapping("/signup")
    public String signUserUp(@RequestBody User userDetails){
        String msg = userService.addUser(userDetails);
        try{
            if(msg.equalsIgnoreCase("success")){
                User newUser = userService.loginUser(userDetails.getUsername(),userDetails.getPassword()).orElseThrow();
                msg = cartService.createCart(newUser);
            }
        } catch (Exception e){
            return "There was an issue creating the cart";
        }
        return msg;
    }


    /*
    Only password and username needed for the user json body
    */
    @PostMapping("/login")
    public Optional<User> loginUser(@RequestBody User userDetails){
        return userService.loginUser(userDetails.getUsername(), userDetails.getPassword());
    }

    /*
    The cart id here is the same as the user's id
    json body should be in the following format, the ids in the custom parts are the actual part ids:
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
            },
            ...
        ]
    }
    */
    @PostMapping("/addToCart/{cartId}")
    public String addVehicleToCart(@RequestBody CustomizedVehicle vehicle, @PathVariable Integer cartId){
        Cart cart;
        try {
            cart = cartService.getCart(cartId).orElseThrow();
        } catch (Exception e) {
            return "Could not get the users cart";
        }        

        VehicleInventory vehicleInventory;
        try {
            vehicleInventory = vehicleService.getInventoryById(vehicle.getVehicleInventory().getVin()).orElseThrow();
        } catch (Exception e) {
            return e.getMessage();
        }        

        if(!vehicleInventory.isAvailable()){
            return "The item trying to be added is not available";
        }

        return cartService.addtoCart(cart, vehicle, vehicleInventory);
    }

    /*
        only provide the user id in the url to load in cart data for the cart screen
    */
    @GetMapping("/getCart/{cartId}")
    public Cart getCart(@PathVariable Integer cartId) {
        try {
            Cart cart = cartService.getCart(cartId).orElseThrow();
            return cart;
        } catch (Exception e) {
            return null;
        } 
    }
    
    /*
        the vehicle id listed here is the one from the Customized vehicle in the coart
        not from the vehicle model
    */
    @DeleteMapping("/removeVehicleFromCart/{vehicleId}")
    public String removeVehicleFromCart(@PathVariable Integer vehicleId){
        CustomizedVehicle vehicle = null;
        try{
            vehicle = vehicleService.getCustomVehicleById(vehicleId).orElseThrow();
        }catch(Exception e){
            return "there was an issue getting the customized vehicle for deletion";
        }

        try{
            return cartService.removeFromCart(vehicle);
        }catch(Exception e){
            return e.getMessage();
        }

    }
    
    /*
        submit the user id and vehicle model id through the path.
        for the json submission, format it like this:
        {
            "reviewText": "This is a review for the vehicle",
            "starRating": 1
        }
    */
    @PostMapping("/createReview/{userId}/{vehicleId}")
    public String createReview(@PathVariable Integer userId, @PathVariable Integer vehicleId, @RequestBody VehicleReview review){
        if(review.getReviewText().isEmpty()){
            return "There is no text in the submitted review";
        }else if(review.getStarRating() < 1 || review.getStarRating() > 5){
            return "The given rating out of 5 should be between 1 and 5";
        }

        User user = null;
        try{
            user = userService.getUserById(userId).orElseThrow();
        }catch(Exception e){
            return "Could not find user data";
        }

        VehicleModel vehicle = null;
        try {
            vehicle = vehicleService.getVehicleById(vehicleId).orElseThrow();
        } catch (Exception e) {
            return "Could not find vehicle data";
        }

        try{
            return userService.addReview(user, vehicle, review);
        }catch(Exception e){
            return "There was an error creating the review";
        }

    }

    /*
        for this one, submit a json formatted like this:
        it will automatically get everything in the cart based on the user
        id and convert it into an order
        make sure the finalPrice has only two decimal places
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
    */
    @PostMapping("/createOrder")
    public String createOrder(@RequestBody UserOrder order){
        Cart cart = null;
        try{
            cart = cartService.getCart(order.getUser().getId()).orElseThrow();
        }catch(Exception e){
            return "Could not get cart details";
        }

        if(cart.getCustomizedVehicle().size() == 0 || cart.getCustomizedVehicle() == null) {
            return "There are no items in the cart to purchase";
        }

        try{
            order.setStatus("In Progress");
            return userService.addOrder(order, cart);
        }catch(Exception e){
            return e.getMessage();
        }

    }

    //just submit the user id through the path to get the orders
    @GetMapping("/orders/{userId}")
    public List<UserOrder> getUserOrders(@PathVariable Integer userId) {
        try {
            User user = userService.getUserById(userId).orElseThrow();
            return userService.getUserOrders(user);
        } catch (Exception e) {
            return null;
        }
    }
    
    
}