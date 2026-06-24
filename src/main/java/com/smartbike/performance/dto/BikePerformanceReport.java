package com.smartbike.performance.dto;

public class BikePerformanceReport {

    private Long bikeId;
    private String bikeName;
    private String bikeModel;
    private Integer totalRides;
    private Double totalDistanceKm;
    private Double totalFuelConsumedLiters;
    private Double totalFuelCost;
    private Double averageMileageKmPerLiter;
    private Double averageCostPerKm;
    private Double averageSpeedKmPerHour;
    private Double maxSpeedKmPerHour;

    // Default Constructor
    public BikePerformanceReport() {
    }

    // Parameterized Constructor
    public BikePerformanceReport(Long bikeId, String bikeName, String bikeModel, Integer totalRides, 
                                 Double totalDistanceKm, Double totalFuelConsumedLiters, Double totalFuelCost, 
                                 Double averageMileageKmPerLiter, Double averageCostPerKm, 
                                 Double averageSpeedKmPerHour, Double maxSpeedKmPerHour) {
        this.bikeId = bikeId;
        this.bikeName = bikeName;
        this.bikeModel = bikeModel;
        this.totalRides = totalRides;
        this.totalDistanceKm = totalDistanceKm;
        this.totalFuelConsumedLiters = totalFuelConsumedLiters;
        this.totalFuelCost = totalFuelCost;
        this.averageMileageKmPerLiter = averageMileageKmPerLiter;
        this.averageCostPerKm = averageCostPerKm;
        this.averageSpeedKmPerHour = averageSpeedKmPerHour;
        this.maxSpeedKmPerHour = maxSpeedKmPerHour;
    }

    // Getters and Setters
    public Long getBikeId() {
        return bikeId;
    }

    public void setBikeId(Long bikeId) {
        this.bikeId = bikeId;
    }

    public String getBikeName() {
        return bikeName;
    }

    public void setBikeName(String bikeName) {
        this.bikeName = bikeName;
    }

    public String getBikeModel() {
        return bikeModel;
    }

    public void setBikeModel(String bikeModel) {
        this.bikeModel = bikeModel;
    }

    public Integer getTotalRides() {
        return totalRides;
    }

    public void setTotalRides(Integer totalRides) {
        this.totalRides = totalRides;
    }

    public Double getTotalDistanceKm() {
        return totalDistanceKm;
    }

    public void setTotalDistanceKm(Double totalDistanceKm) {
        this.totalDistanceKm = totalDistanceKm;
    }

    public Double getTotalFuelConsumedLiters() {
        return totalFuelConsumedLiters;
    }

    public void setTotalFuelConsumedLiters(Double totalFuelConsumedLiters) {
        this.totalFuelConsumedLiters = totalFuelConsumedLiters;
    }

    public Double getTotalFuelCost() {
        return totalFuelCost;
    }

    public void setTotalFuelCost(Double totalFuelCost) {
        this.totalFuelCost = totalFuelCost;
    }

    public Double getAverageMileageKmPerLiter() {
        return averageMileageKmPerLiter;
    }

    public void setAverageMileageKmPerLiter(Double averageMileageKmPerLiter) {
        this.averageMileageKmPerLiter = averageMileageKmPerLiter;
    }

    public Double getAverageCostPerKm() {
        return averageCostPerKm;
    }

    public void setAverageCostPerKm(Double averageCostPerKm) {
        this.averageCostPerKm = averageCostPerKm;
    }

    public Double getAverageSpeedKmPerHour() {
        return averageSpeedKmPerHour;
    }

    public void setAverageSpeedKmPerHour(Double averageSpeedKmPerHour) {
        this.averageSpeedKmPerHour = averageSpeedKmPerHour;
    }

    public Double getMaxSpeedKmPerHour() {
        return maxSpeedKmPerHour;
    }

    public void setMaxSpeedKmPerHour(Double maxSpeedKmPerHour) {
        this.maxSpeedKmPerHour = maxSpeedKmPerHour;
    }
}
