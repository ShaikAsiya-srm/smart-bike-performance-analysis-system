package com.smartbike.performance.controller;

import com.smartbike.performance.entity.Bike;
import com.smartbike.performance.service.BikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/bikes")
public class BikeController {

    private final BikeService bikeService;

    @Autowired
    public BikeController(BikeService bikeService) {
        this.bikeService = bikeService;
    }

    // Endpoint to add/register a new bike
    // HTTP Method: POST, URL: http://localhost:8080/api/bikes
    @PostMapping
    public ResponseEntity<Bike> addBike(@RequestBody Bike bike) {
        Bike savedBike = bikeService.addBike(bike);
        return new ResponseEntity<>(savedBike, HttpStatus.CREATED);
    }

    // Endpoint to list all registered bikes
    // HTTP Method: GET, URL: http://localhost:8080/api/bikes
    @GetMapping
    public ResponseEntity<List<Bike>> getAllBikes() {
        List<Bike> bikes = bikeService.getAllBikes();
        return new ResponseEntity<>(bikes, HttpStatus.OK);
    }

    // Endpoint to get details of a specific bike by its ID
    // HTTP Method: GET, URL: http://localhost:8080/api/bikes/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Bike> getBikeById(@PathVariable Long id) {
        Bike bike = bikeService.getBikeById(id);
        return new ResponseEntity<>(bike, HttpStatus.OK);
    }
}
