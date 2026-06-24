package com.smartbike.performance.repository;

import com.smartbike.performance.entity.Ride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {
    
    // Custom finder method to get all rides for a specific bike
    List<Ride> findByBikeId(Long bikeId);
}
