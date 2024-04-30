import { Component } from '@angular/core';
import emailjs, { EmailJSResponseStatus } from 'emailjs-com';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  sendEmail() {
    const emailParams = {
      from_name: 'Your Name',
      to_name: 'Recipient Name',
      message: 'This is a test email sent from Angular using EmailJS.'
    };

    emailjs.send('service_rlozsra', 'template_g084qyg', emailParams, 'smMdQNxwwWySahS7h')
      .then((response) => {
        console.log('Email sent successfully:', response);
      }, (error) => {
        console.error('Email sending failed:', error);
      });
  }

  
}
