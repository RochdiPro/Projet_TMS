export class Backup {
    backup1: Uint8Array;
    backup2: Uint8Array;
    backup3: Uint8Array;
    dateBackup1: Date;
    dateBackup2: Date;
    dateBackup3: Date;

  constructor(
    backup1: Uint8Array, 
    backup2: Uint8Array, 
    backup3: Uint8Array, 
    dateBackup1: Date, 
    dateBackup2: Date, 
    dateBackup3: Date
) {
    this.backup1 = backup1
    this.backup2 = backup2
    this.backup3 = backup3
    this.dateBackup1 = dateBackup1
    this.dateBackup2 = dateBackup2
    this.dateBackup3 = dateBackup3
  }

}