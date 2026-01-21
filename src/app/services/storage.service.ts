import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { User } from '../login/login_response.model'; 

@Injectable({
  providedIn: 'root'
})

export class StorageService {

  private _storage: Storage | null = null;

  constructor(private storage:Storage) {
    this.initStorage();
   }

  private async initStorage() {
    if (!this._storage) {
      const storage = await this.storage.create();
      this._storage = storage;
    }
  }

  public async set(key: string, value: any) {
    await this.initStorage();
    return this._storage!.set(key, value);
  }

  public async get<T = any>(key: string): Promise<T | null> {
    await this.initStorage();
    const value = await this._storage!.get(key);
    return typeof value === 'undefined' ? null : (value as T);
  }

  // Retrieve user data and map to User interface
  public getUserData(): Promise<User | null> {
    return this.get<User>('user_data');
  }

  getStoredNGRokUrl(): Promise<string | null> {
      return this.get('ng_rok_url');
  }


  
}
