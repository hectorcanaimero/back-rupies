export const SERVICE_CONDITIONS = {
  Opened: { label: "Aberto", color: "bg-blue-500/20 text-blue-400" },
  InProcess: { label: "Em Processo", color: "bg-yellow-500/20 text-yellow-400" },
  Accepted: { label: "Aceito", color: "bg-green-500/20 text-green-400" },
  Scheduled: { label: "Agendado", color: "bg-purple-500/20 text-purple-400" },
  Finished: { label: "Finalizado", color: "bg-emerald-500/20 text-emerald-400" },
  Closed: { label: "Fechado", color: "bg-gray-500/20 text-gray-400" },
  Cancelled: { label: "Cancelado", color: "bg-red-500/20 text-red-400" },
} as const;

export const USER_STATUS = {
  active: { label: "Ativo", color: "bg-green-500/20 text-green-400" },
  banned: { label: "Banido", color: "bg-red-500/20 text-red-400" },
  inactive: { label: "Inativo", color: "bg-gray-500/20 text-gray-400" },
  incomplete: { label: "Incompleto", color: "bg-yellow-500/20 text-yellow-400" },
} as const;

export const JOB_TYPES = {
  Agendado: { label: "Agendado", color: "bg-blue-500/20 text-blue-400" },
  Urgente: { label: "Urgente", color: "bg-red-500/20 text-red-400" },
  Stand: { label: "Stand", color: "bg-gray-500/20 text-gray-400" },
} as const;

export type ServiceCondition = keyof typeof SERVICE_CONDITIONS;
export type UserStatusKey = keyof typeof USER_STATUS;
export type JobType = keyof typeof JOB_TYPES;

/**
 * Derive user status from user fields
 */
export function getUserStatus(user: { ban?: boolean | null; status?: boolean | null; endRegister?: boolean | null }): UserStatusKey {
  if (user.ban) return "banned";
  if (!user.endRegister) return "incomplete";
  if (user.status === false) return "inactive";
  return "active";
}
