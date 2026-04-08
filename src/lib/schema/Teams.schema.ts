import { z } from "zod";

export const CreateTeamMemberRequestSchema = z.object({});
export type CreateTeamMemberRequest = z.infer<
  typeof CreateTeamMemberRequestSchema
>;

export const CreateTeamMemberResponseSchema = z.object({});
export type CreateTeamMemberResponse = z.infer<
  typeof CreateTeamMemberResponseSchema
>;

export const GetTeamMembersResponseSchema = z.object({});
export type GetTeamMembersResponse = z.infer<
  typeof GetTeamMembersResponseSchema
>;

export const GenSingleTeamMemberResponseSchema = z.object({});
export type GenSingleTeamMemberResponse = z.infer<
  typeof GenSingleTeamMemberResponseSchema
>;

export const UpdateTeamMemberRequestSchema = z.object({});
export type UpdateTeamMemberRequest = z.infer<
  typeof UpdateTeamMemberRequestSchema
>;

export const UpdateTeamMemberResponseSchema = z.object({});
export type UpdateTeamMemberResponse = z.infer<
  typeof UpdateTeamMemberResponseSchema
>;
