export interface ScheduleShiftItem {
  booking_id: string;
  booking_number: string;
  customer_name: string;
  machine_id: string;
  machine_name: string;
  registration_number: string;
  operator_id?: string | null;
  operator_name?: string | null;
  site_location: string;
  start_date: string;
  end_date: string;
  rental_type: string;
  status: string;
}
