

class TestVariant extends HTMLElement {
    constructor(){
        super();
        this.variantsJson = JSON.parse(this.querySelector('[data-variants-json]').innerHTML);
        this.atcForm = document.querySelector('product-info product-form form');
        this.addEventListener('change', this.onVariantChange); // when variant changes, update the data
        this.preventATC(); // keep the add to cart un selected by default
    }
    onVariantChange(event) {
        if(event.target.name == 'option[Color]'){
            this.querySelector('select[name="options[Size]"]').options[0].selected = true;
        }
        let selections = this.currentSelections();
        this.updatePrice(selections);
        this.updateMedia();
        this.updateAvailability(selections);
      }

      updatePrice(data){
        document.querySelector(".price__container [data-compareprice]").innerHTML = data.currentVariant.compare_at_price == null ? '' : Shopify.formatMoney(data.currentVariant.compare_at_price);
        document.querySelector(".price__container [data-price]").innerHTML = Shopify.formatMoney(data.currentVariant.price, "${{amount}} CAD");

    }

      updateMedia(){
       let selectedMedia = this.querySelector('input[name="option[Color]"]:checked');
            if(selectedMedia){
               let mediaId = selectedMedia.dataset.mediaid;
                 if(mediaId){
                    let imageButton = document.querySelector(`[data-media-id="${mediaId}"]`);
                    // console.log(imageButton);
                    let mediaGalleryId = imageButton.closest('[data-media-id]').dataset.thumnailId;
                    console.log("mediaGalleryId",mediaGalleryId);
                    document.querySelector('media-gallery').setActiveMedia(mediaGalleryId, false);
                 }
            }
        }

        updateAvailability(selections){
        // console.log(selections);
        this.atcForm.querySelector('input[name="id"]').value = selections.currentVariant.id; 
        if(selections.currentVariant.available){
            if(selections.currentVariant.public_title.toLocaleLowerCase().includes('unselected')){
                this.preventATC();
            }else{
                this.atcForm.querySelector('[name="add"] > span').textContent = window.variantStrings.addToCart;
                this.enableATC();
            }
        }else{
            this.atcForm.querySelector('[name="add"] > span').textContent = window.variantStrings.unavailable;
        }
    }

    enableATC(){
        this.atcForm.querySelectorAll('button').forEach(btn => btn.removeAttribute('disabled'));
    }

    preventATC(){
        this.atcForm.querySelectorAll('button').forEach(btn => btn.setAttribute('disabled','true'));
    }

    currentSelections(){
      let allData = new FormData(this.atcForm);
      let Unselected = false;
      let returnObj = {};
      let selectedValues = []; 
       allData.forEach((val,key)=>{
        let value = val.toLocaleLowerCase();
        if( value == 'unselected'){
            Unselected = true;
           }
        if(key.includes('option')){
            selectedValues.push(value);
        }
        });
       let currentSelectedVariant = this.variantsJson.find(f => f.title.toLowerCase() == selectedValues.join(' / '));
        returnObj.Unselected = Unselected;
        returnObj.currentVariant = currentSelectedVariant;
        return returnObj;
    }

}
customElements.define('variant-selects', TestVariant);