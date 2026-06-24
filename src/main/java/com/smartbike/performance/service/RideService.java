package com.smartbike.performance.service;

import com.smartbike.performance.dto.BikePerformanceReport;
import com.smartbike.performance.entity.Bike;
import com.smartbike.performance.entity.Ride;
import com.smartbike.performance.repository.BikeRepository;
import com.smartbike.performance.repository.RideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RideService {

    private final RideRepository rideRepository;
    private final BikeRepository bikeRepository;

    @Autowired
    public RideService(RideRepository rideRepository, BikeRepository bikeRepository) {
        this.rideRepository = rideRepository;
        this.bikeRepository = bikeRepository;
    }

    // Add a new ride and calculate its performance metrics
    public Ride addRide(Long bikeId, Ride ride) {
        // Fetch the associated bike or throw exception if not found
        Bike bike = bikeRepository.findById(bikeId)
                .orElseThrow(() -> new RuntimeException("Bike not found with ID: " + bikeId));
        
        ride.setBike(bike);

        // Perform ride calculations
        double distance = ride.getDistance();
        double fuelConsumed = ride.getFuelConsumed();
        double fuelPrice = ride.getFuelPricePerLiter();
        double duration = ride.getDurationHours();

        // 1. Calculate mileage = distance / fuelConsumed
        double mileage = (fuelConsumed > 0) ? (distance / fuelConsumed) : 0.0;
        ride.setMileage(round(mileage));

        // 2. Calculate fuel cost = fuelConsumed * fuelPricePerLiter
        double fuelCost = fuelConsumed * fuelPrice;
        ride.setFuelCost(round(fuelCost));

        // 3. Calculate cost per kilometer = fuelCost / distance
        double costPerKm = (distance > 0) ? (fuelCost / distance) : 0.0;
        ride.setCostPerKm(round(costPerKm));

        // 4. Calculate average speed = distance / durationHours
        double averageSpeed = (duration > 0) ? (distance / duration) : 0.0;
        ride.setAverageSpeed(round(averageSpeed));

        // Note: Max speed is directly supplied by user and stored in the database.
        // We round the max speed too, just in case
        ride.setMaxSpeed(round(ride.getMaxSpeed()));

        // Save calculated ride details to database
        return rideRepository.save(ride);
    }

    // Retrieve all rides for a specific bike
    public List<Ride> getRidesByBike(Long bikeId) {
        // First verify that the bike exists
        if (!bikeRepository.existsById(bikeId)) {
            throw new RuntimeException("Bike not found with ID: " + bikeId);
        }
        return rideRepository.findByBikeId(bikeId);
    }

    // Generate bike performance report
    public BikePerformanceReport getBikePerformanceReport(Long bikeId) {
        // Fetch bike to ensure it exists
        Bike bike = bikeRepository.findById(bikeId)
                .orElseThrow(() -> new RuntimeException("Bike not found with ID: " + bikeId));

        List<Ride> rides = rideRepository.findByBikeId(bikeId);

        // If no rides are registered yet, return a clean blank report
        if (rides.isEmpty()) {
            return new BikePerformanceReport(
                    bike.getId(),
                    bike.getName(),
                    bike.getModel(),
                    0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            );
        }

        int totalRides = rides.size();
        double totalDistance = 0.0;
        double totalFuelConsumed = 0.0;
        double totalFuelCost = 0.0;
        double totalDuration = 0.0;
        double maxSpeed = 0.0;

        for (Ride ride : rides) {
            totalDistance += ride.getDistance();
            totalFuelConsumed += ride.getFuelConsumed();
            totalFuelCost += ride.getFuelCost();
            totalDuration += ride.getDurationHours();
            if (ride.getMaxSpeed() > maxSpeed) {
                maxSpeed = ride.getMaxSpeed();
            }
        }

        // Calculate averages across all rides
        double avgMileage = (totalFuelConsumed > 0) ? (totalDistance / totalFuelConsumed) : 0.0;
        double avgCostPerKm = (totalDistance > 0) ? (totalFuelCost / totalDistance) : 0.0;
        double avgSpeed = (totalDuration > 0) ? (totalDistance / totalDuration) : 0.0;

        return new BikePerformanceReport(
                bike.getId(),
                bike.getName(),
                bike.getModel(),
                totalRides,
                round(totalDistance),
                round(totalFuelConsumed),
                round(totalFuelCost),
                round(avgMileage),
                round(avgCostPerKm),
                round(avgSpeed),
                round(maxSpeed)
        );
    }

    // Helper method to round decimal values to 2 places
    private double round(double value) {
        if (Double.isNaN(value) || Double.isInfinite(value)) {
            return 0.0;
        }
        return Math.round(value * 100.0) / 100.0;
    }
}
