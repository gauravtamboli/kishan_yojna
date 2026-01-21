import { Preferences } from '@capacitor/preferences';

async function saveData(key:string,value:string){
await Preferences.set({
  key: key,
  value: value,
});    
}

async function getSavedData(key:string): Promise<string | null> {
     const { value } = await Preferences.get({ key: key })
     return value;
}
