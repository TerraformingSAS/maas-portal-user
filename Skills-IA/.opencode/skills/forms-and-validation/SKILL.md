---
name: forms-and-validation
description: Strict standard for building forms and validation with Zod and ITC components
license: MIT
compatibility: opencode
---

## What I do
- Enforce Zod as the only validation library.
- Ensure the use of `<ItcForm>` and `<ItcInput>` components.
- Provide templates for form validation and typed schemas.

## When to use me
Use this skill whenever the user asks to create, modify, or debug forms, user inputs, or data validation logic.

# Form Handling & Validation (Zod)

This document outlines the strict standard for building forms in our frontend applications.

**CRITICAL RULE:** 
1. **Zod is the ONLY permitted validation library.** Do not use Yup, Joi, or custom validation functions.
2. **Always use the ITC Library Components.** Use `<ItcForm>` as the main wrapper, and use `<ItcInput>` for all fields. Do NOT use native `<form>` or `<input>` HTML tags.

---

## 1. Defining the Schema (Zod)

Always define your validation schemas outside the component to prevent unnecessary re-creations. Extract the TypeScript type directly from the schema using `z.infer` to guarantee type safety throughout the component.

```ts
import { z } from 'zod';

// 1. Define the schema
export const userFormSchema = z.object({
  fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Debe ser un correo electrónico válido'),
  age: z.coerce.number().min(18, 'Debe ser mayor de edad'), // z.coerce parses strings to numbers automatically
  role: z.enum(['ADMIN', 'USER'], { required_error: 'Debe seleccionar un rol' }),
  termsAccepted: z.literal(true, { errorMap: () => ({ message: 'Debe aceptar los términos' }) }),
});

// 2. Infer the TypeScript Type
export type UserFormValues = z.infer<typeof userFormSchema>;
```

---

## 2. Implementing the Form (ItcForm)

The `<ItcForm>` component is specifically designed to accept a `validationSchema`. It automatically handles the validation logic and injects the `errorMessage` into the respective `<ItcInput>` children based on the `name` prop.

### Standard Form Implementation

```tsx
import React, { useState } from 'react';
import { ItcForm, ItcInput, ItcButton } from '@/components';
import { userFormSchema, UserFormValues } from './schema';

export const CreateUserForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true);
    try {
      // values are perfectly typed as UserFormValues and already validated!
      await api.createUser(values);
      console.log('User created:', values);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ItcForm 
      onSubmit={handleSubmit} 
      validationSchema={userFormSchema}
      layout="vertical"
      columns={1} // Use 2 or 3 for grid layouts
    >
      {/* 
        CRITICAL: The 'name' prop must match EXACTLY with the Zod schema keys.
        ItcForm uses the 'name' prop to map errors and values automatically.
      */}
      
      <ItcInput 
        name="fullName" 
        label="Nombre Completo" 
        placeholder="Ej: Juan Pérez" 
      />

      <ItcInput 
        name="email" 
        type="email" 
        label="Correo Electrónico" 
      />

      <ItcInput 
        name="age" 
        type="number" 
        label="Edad" 
      />

      <ItcInput 
        name="role" 
        type="select" 
        label="Rol"
      >
        <option value="" disabled>Seleccione un rol</option>
        <option value="ADMIN">Administrador</option>
        <option value="USER">Usuario Estándar</option>
      </ItcInput>

      <ItcInput 
        name="termsAccepted" 
        type="checkbox" 
        label="Acepto los términos y condiciones" 
      />

      <div className="mt-4 flex justify-end">
        <ItcButton type="submit" variant="primary" loading={isSubmitting}>
          Guardar Usuario
        </ItcButton>
      </div>
    </ItcForm>
  );
};
```

---

## 3. Best Practices

- **Controlled vs Uncontrolled:** `<ItcForm>` handles the internal state of the inputs automatically. You generally do not need to use `useState` for individual inputs unless you have highly specific reactive UI needs (like conditionally showing a field based on the live value of another).
- **Matching `name` Props:** The `name="fieldName"` attribute on your `<ItcInput>` must perfectly match the key in your Zod schema object. If they mismatch, validation errors will not display correctly.
- **Error Display:** You do NOT need to manually pass `errorMessage={...}` to inputs. The `ItcForm` will automatically inject errors into `<ItcInput>` when validation fails during `onSubmit` or `onChange` (depending on `ItcForm` props like `validateOnChange`).
- **Coercion:** Always use `z.coerce.number()` or `z.coerce.date()` for numeric and date inputs, as HTML input elements inherently return string values.
