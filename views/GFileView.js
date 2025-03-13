export default class AFileView {
    static newFileDialog() {
        let myForm = AFileView.newFileForm();
        w2popup.open({
            title: 'New File',
            body: '<div id="newFileForm"></div>',
            width: 300,
            height: 200,
            showMax: true,
            onOpen: function (event) {
                $('#newFileForm').w2form(myForm);
                myForm.refresh();
            }
        })
    }

    static newFileForm() {
        if (!w2ui.newFileForm) {
            $().w2form({
                name: 'newFileForm',
                fields: [
                    {
                        name: 'type',
                        type: 'radio',
                        required: true,
                        html: {
                            caption: 'Type',
                            text: 'Select a type'
                        },
                        options: {
                            items: ['Customer', 'Partner', 'Architecture']
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
                            console.log('Form Data:', record);
                            w2popup.close();
                            w2alert('Saved successfully!');
                        }
                    },
                    cancel: function () {
                        w2popup.close();
                    }
                }
            });
        } else {
            w2ui.newFileForm.clear();
        }
        return w2ui.newFileForm;
    }
}