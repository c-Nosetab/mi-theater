type RouteValidationObj = {
  BODY: any;

  PERMISSIONS: string[];
  allRequired?: boolean; // DEFAULT FALSE

  notes?: string;
  allowsForSpecialUseCase?: boolean; // ie user can update themselves OR user can push courses to other users when they manage their activity
};

type RouteValidationMap = {
  [route: string]: {
    GET?: RouteValidationObj;
    POST?: RouteValidationObj;
    PUT?: RouteValidationObj;
    DELETE?: RouteValidationObj;
  };
};

const ROUTE_VALIDATION_MAP: RouteValidationMap = {};

export default ROUTE_VALIDATION_MAP;
export { RouteValidationObj };
