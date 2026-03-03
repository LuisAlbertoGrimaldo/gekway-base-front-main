import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [RouterOutlet],
    standalone: true
})
export class AppComponent implements OnInit {
    private authService = inject(AuthService);

    ngOnInit(): void {
        // 🔑 Rehidrata usuario y permisos al arrancar
        this.authService.check().subscribe({
            next: (ok) => console.log('Sesión válida:', ok),
            error: (err) => console.error('Error al validar sesión', err)
        });
    }
}
