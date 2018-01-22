odoo.define('odoo_attendance_task.my_attendances', function (require) {
"use strict";
    var core = require('web.core');
    var Widget = require('web.Widget');
    var QWeb = core.qweb;
    var _t = core._t;
    var hr_attendance = require('hr_attendance.my_attendances');
    var greeting_message = require('hr_attendance.greeting_message');

    hr_attendance.include({
        start: function () {
            var self = this;
            this.task_list = []
            this.selected_task = 0
            this._rpc({
                    model: 'hr.employee',
                    method: 'search_read',
                    args: [[['user_id', '=', self.getSession().uid]], ['attendance_state', 'name','task']],
                })
                .then(function (res) {
                    self._rpc({
                                model: 'hr.attendance',
                                method: 'get_employee_all_task',
                                args: [[self.getSession().uid],res[0]['id']],
                            },{async: false})
                        .then(function(res){
                            self.task_list = res
                        });

                        self.task = res[0]['task'][1]

                if (_.isEmpty(res) ) {
                    self.$('.o_hr_attendance_employee').append(_t("Error : Could not find employee linked to user"));
                    return;
                }
                self.employee = res[0];
                self.$el.html(QWeb.render("HrAttendanceMyMainMenu", {widget: self,task_list:self.task_list}));
                $('.down-arrow').on('click',function(){
                    $('#task').focus();
                })
                $('#task').autocomplete({
                       source:self.task_list,
                       minLength: 0,
                       scroll: true,
                       select: function(event, ui) {
                       self.selected_task = ui.item.id
                       },
                   }).focus(function() {
                        $('#task').autocomplete("search", "");
                    });
            });
        },
        update_attendance: function () {
            var self = this;
            var task_id = this.selected_task;
            var task = $('#task').val();
            if (task){
                this._rpc({
                        model: 'hr.employee',
                        method: 'attendance_manual',
                        args: [[self.employee.id], 'hr_attendance.hr_attendance_action_my_attendances'],
                    })
                    .then(function(result) {
                        if (result.action) {
                            var emp_id = result.action.attendance.employee_id[0]
                            var id = result.action.attendance['id'];
                            self._rpc({
                                model: 'hr.attendance',
                                method: 'add_employee_task',
                                args: [[id],task_id, task,emp_id],
                            },{async: false})
                            self.do_action(result.action);
                        } else if (result.warning) {
                            self.do_warn(result.warning);
                        }
                    });
            }else{
                if (typeof($(document).find('#task').html()) != "undefined" ){
                    $('#task').css('border','1px solid red');
                }else{
                    self._super();
                }
            }
        },
    });

    greeting_message.include({

        init: function(parent, action) {
            var self = this;
            this._super.apply(this, arguments);
            this.activeBarcode = true;
            if(!action.attendance) {
                this.activeBarcode = false;
                this.getSession().user_has_group('hr_attendance.group_hr_attendance_user').then(function(has_group) {
                    if(has_group) {
                        self.next_action = 'hr_attendance.hr_attendance_action_kiosk_mode';
                    } else {
                        self.next_action = 'hr_attendance.hr_attendance_action_my_attendances';
                    }
                });
                return;
            }
            var employee_id = action.attendance.employee_id[0]
            self._rpc({
                    model: 'hr.employee',
                    method: 'check_employee_task',
                    args: [[employee_id]],
                },{async: false}).then(function(res){
                    self.task = res;
                 });
            this.next_action = action.next_action || 'hr_attendance.hr_attendance_action_my_attendances';
            // no listening to barcode scans if we aren't coming from the kiosk mode (and thus not going back to it with next_action)
            if (this.next_action != 'hr_attendance.hr_attendance_action_kiosk_mode' && this.next_action.tag != 'hr_attendance_kiosk_mode') {
                this.activeBarcode = false;
            }
            this.attendance = action.attendance;
            // check in/out times displayed in the greeting message template.
            this.attendance.check_in_time = (new Date((new Date(this.attendance.check_in)).valueOf() - (new Date()).getTimezoneOffset()*60*1000)).toTimeString().slice(0,8);
            this.attendance.check_out_time = this.attendance.check_out && (new Date((new Date(this.attendance.check_out)).valueOf() - (new Date()).getTimezoneOffset()*60*1000)).toTimeString().slice(0,8);
            this.previous_attendance_change_date = action.previous_attendance_change_date;
            this.employee_name = action.employee_name;
        },
    });
});
