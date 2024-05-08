import { Routes } from 'get-routes/build/lib/Routes';

const formatRoute = (route: string): string =>
  route.split('?')[0]
    .replace(/\/+$/, '') // Remove trailing slashes
    .replace(/\d+/g, ':id'); // Replace all numbers with :id to match the route

const requestMethodIsValid = ({
  appRoutes,
  route,
  method,
}: {
  appRoutes: Routes;
  route: string;
  method: string;
}): boolean => {
  if (!Object.keys(appRoutes).includes(method.toLowerCase())) {
    return false;
  }

  const formattedRoute = formatRoute(route);

  return appRoutes[method.toLowerCase()]
    .map(route => formatRoute(route))
    .includes(formattedRoute);
};

const routeIsValid = ({
  appRoutes,
  route,
}: {
  appRoutes: Routes;
  route: string;
}): boolean => {
  const formattedRoute = formatRoute(route);

  return Object.values(appRoutes)
    .flat()
    .map(route => formatRoute(route))
    .includes(formattedRoute);
};

export {
  formatRoute,
  requestMethodIsValid,
  routeIsValid,
};
