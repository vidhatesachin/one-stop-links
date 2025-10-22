import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export interface ConfirmDialog {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export interface InputDialog {
  title: string;
  message?: string;
  inputs: {
    id: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'url';
    placeholder?: string;
    required?: boolean;
    pattern?: string;
    patternMessage?: string;
    value?: string;
  }[];
  confirmText?: string;
  cancelText?: string;
  onConfirm: (values: Record<string, string>) => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private confirmDialogSubject = new BehaviorSubject<ConfirmDialog | null>(null);
  public confirmDialog$ = this.confirmDialogSubject.asObservable();

  private inputDialogSubject = new BehaviorSubject<InputDialog | null>(null);
  public inputDialog$ = this.inputDialogSubject.asObservable();

  success(title: string, message = '', duration = 3000): void {
    this.addNotification('success', title, message, duration);
  }

  error(title: string, message = '', duration = 5000): void {
    this.addNotification('error', title, message, duration);
  }

  warning(title: string, message = '', duration = 4000): void {
    this.addNotification('warning', title, message, duration);
  }

  info(title: string, message = '', duration = 3000): void {
    this.addNotification('info', title, message, duration);
  }

  confirm(message: string, title = 'Confirm Action'): Observable<boolean> {
    const subject = new Subject<boolean>();
    
    const dialog: ConfirmDialog = {
      title,
      message,
      confirmText: 'Yes',
      cancelText: 'No',
      onConfirm: () => {
        subject.next(true);
        subject.complete();
        this.closeConfirmDialog();
      },
      onCancel: () => {
        subject.next(false);
        subject.complete();
        this.closeConfirmDialog();
      }
    };
    
    this.confirmDialogSubject.next(dialog);
    return subject.asObservable();
  }

  closeConfirmDialog(): void {
    this.confirmDialogSubject.next(null);
  }

  input(config: {
    title: string;
    message?: string;
    inputs: InputDialog['inputs'];
    confirmText?: string;
    cancelText?: string;
  }): Observable<Record<string, string> | null> {
    const subject = new Subject<Record<string, string> | null>();
    
    const dialog: InputDialog = {
      ...config,
      confirmText: config.confirmText || 'Submit',
      cancelText: config.cancelText || 'Cancel',
      onConfirm: (values) => {
        subject.next(values);
        subject.complete();
        this.closeInputDialog();
      },
      onCancel: () => {
        subject.next(null);
        subject.complete();
        this.closeInputDialog();
      }
    };
    
    this.inputDialogSubject.next(dialog);
    return subject.asObservable();
  }

  closeInputDialog(): void {
    this.inputDialogSubject.next(null);
  }

  private addNotification(type: Notification['type'], title: string, message: string, duration?: number): void {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const notification: Notification = { id, type, title, message, duration };
    
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([...current, notification]);

    if (duration) {
      setTimeout(() => this.removeNotification(id), duration);
    }
  }

  removeNotification(id: string): void {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next(current.filter(n => n.id !== id));
  }
}
