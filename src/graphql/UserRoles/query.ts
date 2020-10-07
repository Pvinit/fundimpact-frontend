import { gql } from "@apollo/client";

export const GET_ROLES_BY_ORG = gql`
	query getRoles($filter: JSON, $sort: String, $limit: Int, $start: Int) {
		organizationRoles(sort: $sort, limit: $limit, start: $start, where: $filter) {
			id
			name
			type
			organization {
				id
				name
			}
		}
	}
`;

export const GET_INVITED_USER_LIST = gql`
	query userList($sort: String, $limit: Int, $start: Int, $filter: JSON) {
		userList(sort: $sort, limit: $limit, start: $start, where: $filter) {
			id
			email
			confirmed
			blocked
			role {
				id
				name
			}
			organization {
				id
				name
			}
		}
	}
`;

export const GET_INVITED_USER_LIST_COUNT = gql`
	query userListCount($filter: JSON) {
		userListCount(where: $filter)
	}
`;

export const ORGANIZATION_ROLES_COUNT = gql`
	query {
		organizationRolesCount
	}
`;
