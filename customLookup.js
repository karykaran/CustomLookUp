import { LightningElement, api, track } from 'lwc';
import searchRecords from '@salesforce/apex/LookupLWCController.searchRecords';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


const DELAY = 350;


export default class Lookup extends LightningElement {
  @api
  filters
  @api
  objectApiName;
  showPill = false;
  @api
  multiSelect = false;
  @api
  label;
  @track
  records = null
  @api
  selectedIds = []
  iconName = 'standard:app';
  @track
  selectedRecords = [];
  @track
  searchKey;
  loading = false;
  noRecords = false;
  @api disableInput;

  connectedCallback(e) {
    this.iconName = 'standard:' + this.objectApiName.toLowerCase();
  }


  handleKeyChange(event) {
    window.clearTimeout(this.delayTimeout);
    if (event.target.value) {
      this.loading = true;
      this.noRecords = true;
      const searchKey = event.target.value;
      const objectApiName = this.objectApiName;
      const selectedIds = this.selectedIds;
      const filter = this.filters;
      console.log(JSON.stringify(filter));
      this.delayTimeout = setTimeout(() => {
        searchRecords({ searchKey: searchKey, objectApiName: objectApiName, selectedIds: selectedIds, filters: filter , isUatPortal: this.isUatPortal ,userIdList:this.userIdList})
          .then((result) => {
            if (result && result.length) {
              this.noRecords = false;
              this.loading = false;
              this.records = result;
              this.error = undefined;
            } else {
              this.loading = false;
              this.records = null;
            }
          })
          .catch((ex) => {
            this.loading = false;
            const toastEvent = new ShowToastEvent({
              title: 'Error',
              message: ex.body.message,
            });
            this.dispatchEvent(toastEvent);
            this.error = ex;
            this.records = null;
          });
      }, DELAY);
    } else {
      this.records = null;
      this.noRecords = false;
      this.loading = false;
    }
  }
  addToSelected(event) {
    var params = {};
    var selectedId = event.target.getAttribute('value');
    this.records.map(record => {
      if (!this.selectedIds.includes(record.Id) && record.Id == selectedId) {
        if (this.multiSelect) {
          this.selectedRecords.push(record);
          this.selectedIds.push(record.Id);
        } else {
          this.selectedRecord = record;
          this.showPill = true;
        }
      }
    })
    if (this.multiSelect) {
      params = this.selectedRecords;
    } else {
      params = this.selectedRecord;
    }
    const selectedEvent = new CustomEvent('recordupdated', { detail: params });
    this.dispatchEvent(selectedEvent);
    this.records = null;
  }
  handleRemove(event) {
    var toRemove = event.detail.name;
    if (this.selectedIds.includes(toRemove)) {
      this.selectedRecords.splice(this.selectedIds.indexOf(toRemove), 1);
      this.selectedIds.splice(this.selectedIds.indexOf(toRemove), 1);
    }
    const selectedEvent = new CustomEvent('recordupdated', { detail: this.selectedRecords });
    this.dispatchEvent(selectedEvent);
  }
  clear(event) {
    this.selectedRecord = null;
    this.showPill = false;
    const selectedEvent = new CustomEvent('recordupdated', { detail: this.selectedRecord });
    this.dispatchEvent(selectedEvent);
  }
}
