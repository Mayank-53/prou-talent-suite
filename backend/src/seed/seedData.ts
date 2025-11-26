import bcrypt from 'bcryptjs';
import { EmployeeModel } from '../models/Employee';
import { TaskModel } from '../models/Task';
import { UserModel } from '../models/User';
import { mockEmployees, mockTasks } from '@shared/mockData';
import { env } from '../config/env';

export const seedData = async () => {
  const existingEmployees = await EmployeeModel.countDocuments();
  if (existingEmployees === 0) {
    const sanitized = mockEmployees.map(({ _id, ...rest }) => rest);
    await EmployeeModel.insertMany(sanitized);
    console.log('✅ Seeded employees collection');
  }

  const existingTasks = await TaskModel.countDocuments();
  if (existingTasks === 0) {
    const employees = await EmployeeModel.find();
    const employeeMap = new Map(employees.map((emp) => [emp.email, emp._id]));

    const seededTasks = mockTasks.flatMap(({ _id, assignedTo, ...rest }) => {
      const targetId = employeeMap.get(assignedTo as string);
      if (!targetId) return [];
      return [{ ...rest, assignedTo: targetId }];
    });

    await TaskModel.insertMany(seededTasks);
    console.log('✅ Seeded tasks collection');
  }

  // Create default admin user if not exists
  const adminExists = await UserModel.findOne({ email: 'mayankkishor53@gmail.com' });
  if (!adminExists) {
    const password = await bcrypt.hash('Mayank@123', 10);
    await UserModel.create({
      name: 'Admin User',
      email: 'mayankkishor53@gmail.com',
      password,
      role: 'admin',
    });
    console.log('✅ Seeded default admin user');
  }
  
  // Create placeholder employee users for each employee
  const employees = await EmployeeModel.find();
  for (const employee of employees) {
    const employeeUserExists = await UserModel.findOne({ email: employee.email });
    if (!employeeUserExists) {
      await UserModel.create({
        name: employee.name,
        email: employee.email,
        password: 'PLACEHOLDER_PASSWORD_WILL_BE_SET_ON_SIGNUP',
        role: 'employee',
      });
    }
  }
  console.log('✅ Created employee placeholders');
};

