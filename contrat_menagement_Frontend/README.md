# Email Reminder

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.1.

## Development server

Run `npm install` to install node modules
Run `ng serve -o` to run it. It will navigate you to `http://localhost:4200/`.

## Enable Email Reminder

Go to this link and register with the Email you wanna use [https://dashboard.emailjs.com]
In this link when you login create a service and template,
then coppy you `Service ID`, `Template ID` and You `Public Key` then 
go to app.component.ts and paste here `emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams, 'YOUR_PUBLIC_KEY')`

## Running unit tests

Change the set intervial at 6000 to test it
