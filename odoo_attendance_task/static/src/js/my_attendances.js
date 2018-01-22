odoo.define('odoo_attendance_task.my_attendances', function (require) {
"use strict";
    var core = require('web.core');
    var Model = require('web.Model');
    var Widget = require('web.Widget');

    var QWeb = core.qweb;
    var _t = core._t;
    var hr_attendance = require('hr_attendance.my_attendances');
    var greeting_message = require('hr_attendance.greeting_message');

    hr_attendance.include({
        start: function () {
            var self = this;

            var hr_employee = new Model('hr.employee');
            var hr_attendance_model = new Model('hr.attendance');

            hr_employee.query(['attendance_state', 'name','task'])
                .filter([['user_id', '=', self.session.uid]])
                .all()
                .then(function (res) {
                    if (_.isEmpty(res) ) {
                        self.$('.o_hr_attendance_employee').append(_t("Error : Could not find employee linked to user"));
                        return;
                    }
                    hr_attendance_model.call('get_employee_all_task',[[self.session.uid],res[0]['id']],{}, {async: false})
                    .then(function(res){
                        self.task_list = res
                    });
                    self.task = res[0]['task'][1]
                    self.employee = res[0];
                    self.$el.html(QWeb.render("HrAttendanceMyMainMenu", {widget: self}));
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
            var task = $('#task').val();
            var task_id = this.selected_task;

            if (task){
                var hr_employee = new Model('hr.employee');
                var hr_attendance_model = new Model('hr.attendance');
                hr_employee.call('attendance_manual', [[self.employee.id], 'hr_attendance.hr_attendance_action_my_attendances'])
                .then(function(result) {
                    if (result.action) {
                        var emp_id = result.action.attendance.employee_id[0]
                        var id = result.action.attendance['id'];
                        hr_attendance_model.call('add_employee_task',[[id],task_id,task,emp_id],{}, {async: false});
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
        }
    });

    greeting_message.include({
        init: function(parent, action) {
            var self = this;
            var hr_employee = new Model('hr.employee');
            var employee_id = action.attendance.employee_id[0]
            hr_employee.call('check_employee_task',[[employee_id]],	{}, {async: false}).then(function(res){
                self.task = res;
            });
            self._super(parent, action);
        },
    });
});
