import '@angular/localize/init';
import 'cypress-axe';

Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});
