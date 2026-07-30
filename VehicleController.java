package com.eecs4413.evsystem.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eecs4413.evsystem.models.VehicleCustomPart;
import com.eecs4413.evsystem.models.VehicleInventory;
import com.eecs4413.evsystem.models.VehicleModel;
import com.eecs4413.evsystem.models.VehicleReview;
import com.eecs4413.evsystem.models.VisitEvent;
import com.eecs4413.evsystem.service.VehicleService;

import jakarta.servlet.http.HttpServletRequest;



@RestController
@RequestMapping("/vehicle")
public class VehicleController{
    
    public final VehicleService vehicleService;

    VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    //probably wont use this, but if you need it you can get a vehicle model by its id here
    @GetMapping("/{vehicleId}")
    public Optional<VehicleModel> getVehicle(@PathVariable int vehicleId){
        return vehicleService.getVehicleById(vehicleId);
    }

    //private method you wont use
    private String getIPFromClient(HttpServletRequest request){
        return request.getRemoteAddr();
    }

    //private method you wont use
    private String getCurrentDate(){
        return LocalDate.now().toString();
    }

    /*when someone clicks into a vehicle, send the following data:
        {
            "eventType": "Clicked into vehicle",
            "vehicleModel": {
                "id": 2
            }
        }
    */
    @PostMapping("/saveEvent")
    public String saveEvent(@RequestBody VisitEvent visitEvent, HttpServletRequest request){
        String ipAddress = getIPFromClient(request);
        visitEvent.setIpaddress(ipAddress);
        visitEvent.setDay(getCurrentDate());

        try{
            return vehicleService.saveEvent(visitEvent);
        }catch(Exception e){
            return "could not save event";
        }
    }

    /*
    this one will take in params from the path (/search?keyword=*&onSale=*&sortByPrice+*)
    if nothing is give, every vehicle in the database will be returned
    the inputted keyword will search the brand model and year in each table for something that matches
    if onSale is true, it will only return vehicles that are on sale
    if sortByPrice = asc, it will sort by the price ascending
    if sortByPrice = desc. it will sort by the price descending
    */
    @GetMapping("/search")
    public List<VehicleModel> searchVehicles(@RequestParam(required = false) String keyword, @RequestParam(required = false) Boolean onSale, @RequestParam(required = false) String sortByPrice){
        return vehicleService.searchForVehicles(keyword, onSale, sortByPrice);
    }

    /*
    when loading into a vehicles detail page call this to get the reviews
    */
    @GetMapping("/reviews/{vehicleId}")
    public List<VehicleReview> getVehicleReviews(@PathVariable Integer vehicleId){
        return vehicleService.getReviewsById(vehicleId);
    }

    /*
    when loading into a vehicles detail page call this to get the all the inventory
    note that all inventory is called so only allow the user to add to cart an inventory 
    where isAvailable is true
    */
    @GetMapping("/inventory/{vehicleId}")
    public List<VehicleInventory> getVehicleInventory(@PathVariable Integer vehicleId){
        return vehicleService.getInventoryByModelId(vehicleId);
    }

    /*
    when loading into a vehicles detail page call this to get the list of parts
    */
    @GetMapping("/parts/{vehicleId}")
    public List<VehicleCustomPart> getVehicleParts(@PathVariable Integer vehicleId){
        return vehicleService.getPartsByModelId(vehicleId);
    }
}