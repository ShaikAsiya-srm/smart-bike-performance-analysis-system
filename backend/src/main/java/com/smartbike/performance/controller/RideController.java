package com.smartbike.performance.controller;

import com.smartbike.performance.dto.BikePerformanceReport;
import com.smartbike.performance.entity.Ride;
import com.smartbike.performance.service.RideService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/rides")
public class RideController {

    private final RideService rideService;

    @Autowired
    public RideController(RideService rideService) {
        this.rideService = rideService;
    }

    // Endpoint to add a ride detail for a specific bike
    // HTTP Method: POST, URL: http://localhost:8080/api/rides/bike/{bikeId}
    @PostMapping("/bike/{bikeId}")
    public ResponseEntity<Ride> addRide(@PathVariable Long bikeId, @RequestBody Ride ride) {
        Ride savedRide = rideService.addRide(bikeId, ride);
        return new ResponseEntity<>(savedRide, HttpStatus.CREATED);
    }

    // Endpoint to get all rides for a specific bike
    // HTTP Method: GET, URL: http://localhost:8080/api/rides/bike/{bikeId}
    @GetMapping("/bike/{bikeId}")
    public ResponseEntity<List<Ride>> getRidesByBike(@PathVariable Long bikeId) {
        List<Ride> rides = rideService.getRidesByBike(bikeId);
        return new ResponseEntity<>(rides, HttpStatus.OK);
    }

    // Endpoint to get the complete performance report for a specific bike
    // HTTP Method: GET, URL: http://localhost:8080/api/rides/bike/{bikeId}/report
    @GetMapping("/bike/{bikeId}/report")
    public ResponseEntity<BikePerformanceReport> getBikePerformanceReport(@PathVariable Long bikeId) {
        BikePerformanceReport report = rideService.getBikePerformanceReport(bikeId);
        return new ResponseEntity<>(report, HttpStatus.OK);
    }
}
