from odoo import fields, models, api


class HRAttendance(models.Model):
    _inherit = 'hr.attendance'

    task = fields.Many2one('hr.employee.task', string="Task")

    def add_employee_task(self,task_id, task,emp_id):
        if not task_id and task:
            res = self.env['hr.employee.task'].create({
                'employee_id':emp_id if emp_id else False,
                'task':task
            })
            self.write({
                'task': res.id
            })
            self.employee_id.write({
                'task': res.id
            })
        elif not task and task_id:
            self.write({
                'task': task_id
            })
            self.employee_id.write({
                'task': task_id
            })
        elif task_id and task:
            task_obj = self.env['hr.employee.task'].search([('id','=',task_id)])
            if task_obj.task == task:
                self.write({
                    'task': task_id
                })
                self.employee_id.write({
                    'task': task_id
                })
            else:
                res = self.env['hr.employee.task'].create({
                    'employee_id': emp_id if emp_id else False,
                    'task': task
                })
                self.write({
                    'task': res.id
                })
                self.employee_id.write({
                    'task': res.id
                })

    def get_employee_all_task(self,emp_id=False):
        task_list = []
        res = self.env['hr.employee.task'].sudo().search([('employee_id','=',emp_id)])

        for each in res:
            task_list.append({
                'id':each.id,
                'value':each.task,
                'label':each.task,
            })
        return task_list


class HREmployee(models.Model):
    _inherit = 'hr.employee'

    task = fields.Many2one('hr.employee.task',string="Task")

    def check_employee_task(self):
        return self.task.task


class HREmployeeTask(models.Model):
    _name = 'hr.employee.task'
    _rec_name = 'task'

    employee_id = fields.Many2one('hr.employee',string="Employee")
    task = fields.Char(string="Task")
