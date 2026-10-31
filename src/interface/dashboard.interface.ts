export interface DashboardSummaryDto {
  total_machines: number;
  available_machines: number;
  rented_machines: number;
  maintenance_machines: number;
  total_customers: number;
  active_rentals_count: number;
  monthly_revenue: number;
  pending_payments_total: number;
}
