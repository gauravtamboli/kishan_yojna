export interface User {
  emp_id: string;
  f_name: string;
  l_name: string;
  designation_id: number;
  user_name: string;
  password: string;
  is_active: number;
  mobile_number: string;
  circle_id: string;
  division_id: string;
  range_id: string;
  beat_id: string;
  sub_division_id: string;
  is_self_verified: number;  // You can replace `any` with a more specific type if needed.
}

interface SuccessResponse {
  status_code: number;
  message: string;
}

export  interface LoginResponse {
  success: SuccessResponse;
  Users: User[];
}