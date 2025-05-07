import GMainView from './GMainView.js';

export default class GFileView {
    static newFileDialog() {
        let myForm = GFileView.newFileForm();
        w2popup.open({
            title: 'New File',
            body: '<div id="newFileFormContainer" style="width: 100%; height: 100%;"></div>', // Update ID
            width: 400,
            height: 300,
            showMax: true,
            onOpen: function (event) {
                event.onComplete = function () {
                    if (!w2ui.newFileForm) {
                        $('#newFileFormContainer').w2form(myForm); // Attach the form after popup fully opens
                    } else {
                        w2ui.newFileForm.refresh();
                    }
                };
            },
            onClose: function () {
                if (w2ui.newFileForm) {
                    w2ui.newFileForm.destroy(); // Remove form instance on close
                }
            }
        });
    }

    static newFileForm() {
        if (!w2ui.newFileForm) {
            return {
                name: 'newFileForm',
                fields: [
                    {
                        name: 'type',
                        type: 'radio',
                        options: {
                            items: ['Customer', 'Partner', 'Architecture'] // Set radio options
                        },
                        required: true,
                        html: {
                            caption: 'Type',
                            text: 'Select a type'
                        }
                    },
                    {
                        name: 'name',
                        type: 'text',
                        required: true,
                        html: {
                            caption: 'Name',
                            text: 'Enter element name'
                        }
                    }
                ],
                actions: {
                    save: function () {
                        const record = this.record;
                        if (this.validate().length === 0) {
                            GMainView.setContext(record);
                            console.log('Form Data:', record);
                            w2popup.close();
                            w2alert('Saved successfully!');
                        }
                    },
                    cancel: function () {
                        w2popup.close();
                    }
                }
            };
        }
        w2ui.newFileForm.clear();
        return w2ui.newFileForm;
    }
}