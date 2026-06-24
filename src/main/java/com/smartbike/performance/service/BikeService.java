package com.smartbike.performance.service;

import com.smartbike.performance.entity.Bike;
import com.smartbike.performance.repository.BikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BikeService {

    private final BikeRepository bikeRepository;

    @Autowired
    public BikeService(BikeRepository bikeRepository) {
        this.bikeRepository = bikeRepository;
    }

    // Register a new bike
    public Bike addBike(Bike bike) {
        return bikeRepository.save(bike);
    }

    // Retrieve all registered bikes
    public List<Bike> getAllBikes() {
        return bikeRepository.findAll();
    }

    // Retrieve a single bike by ID
    public Bike getBikeById(Long id) {
        return bikeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bike not found with ID: " + id));
    }
}
