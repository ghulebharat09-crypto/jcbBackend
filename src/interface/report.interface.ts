export interface MonthlyRevenueItem {
  month: string;
  year: number;
  total_revenue: number;
  bookings_count: number;
}

export interface FleetUtilizationDto {
  total_fleet: number;
  rented_count: number;
  available_count: number;
  maintenance_count: number;
  utilization_percentage: number;
}
