export const environment = {
  production: true,
  apiUrl: 'https://financecare-api.herokuapp.com',

  tokenWhitelistedDomains: [ new RegExp('financecare-api.herokuapp.com') ],
  tokenBlacklistedRoutes: [ new RegExp('\/oauth\/token') ]
};
