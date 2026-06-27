export interface AuditLog {
  id: string;
  created_at: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details?: Record<string, any>;
  
  // Joined relation (populated via select)
  user?: {
    full_name: string;
    employee_code: string;
  };
}

export interface CreateAuditLogInput {
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details?: Record<string, any>;
}
