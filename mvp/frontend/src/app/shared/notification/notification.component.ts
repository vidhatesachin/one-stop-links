import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];
  confirmDialog$ = this.notificationService.confirmDialog$;
  currentDialog: any = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });
    
    this.confirmDialog$.subscribe(dialog => {
      this.currentDialog = dialog;
    });
  }

  removeNotification(id: string): void {
    this.notificationService.removeNotification(id);
  }

  getIconClass(type: string): string {
    const icons: Record<string, string> = {
      success: 'fas fa-check-circle text-green-500',
      error: 'fas fa-exclamation-circle text-red-500',
      warning: 'fas fa-exclamation-triangle text-yellow-500',
      info: 'fas fa-info-circle text-blue-500'
    };
    return icons[type] || icons['info'];
  }

  getBgClass(type: string): string {
    const classes: Record<string, string> = {
      success: 'bg-green-50 border-green-200',
      error: 'bg-red-50 border-red-200',
      warning: 'bg-yellow-50 border-yellow-200',
      info: 'bg-blue-50 border-blue-200'
    };
    return classes[type] || classes['info'];
  }

  onConfirm(): void {
    if (this.currentDialog?.onConfirm) {
      this.currentDialog.onConfirm();
    }
    this.notificationService.closeConfirmDialog();
  }

  onCancel(): void {
    if (this.currentDialog?.onCancel) {
      this.currentDialog.onCancel();
    }
    this.notificationService.closeConfirmDialog();
  }

  closeDialog(): void {
    this.notificationService.closeConfirmDialog();
  }
}
