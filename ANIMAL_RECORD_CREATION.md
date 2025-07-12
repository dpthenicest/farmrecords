# Animal Creation with Automatic Record Creation

## Overview

When a new animal batch is created in the farm records system, an automatic purchase record is created to track the financial transaction associated with acquiring the animals.

## How It Works

### 1. Animal Creation Process

When a user creates a new animal through the UI:

1. **Animal Creation**: The animal is created in the database with basic information (name, type, description)
2. **Automatic Record Creation**: A purchase record is automatically created for the animal
3. **Error Handling**: If record creation fails, the animal is still created but a warning is returned

### 2. Required Fields for Record Creation

The system automatically creates a record with the following fields:

- **Category**: "Animal Purchase" (created automatically if it doesn't exist)
- **Unit Price**: From the purchase form (defaults to 0 if not provided)
- **Quantity**: Number of animals purchased
- **Note**: Auto-generated note describing the purchase
- **Date**: Purchase date (defaults to current date)
- **Animal ID**: Links the record to the specific animal
- **User ID**: Links the record to the user who created it

### 3. API Endpoint

**POST** `/api/animals`

**Request Body:**
```json
{
  "name": "Goat Batch A",
  "animalTypeId": "animal_type_id",
  "description": "Young goats for breeding",
  "userId": "user_id",
  "purchasePrice": 500.00,
  "quantity": 5,
  "note": "Purchased from local farmer",
  "purchaseDate": "2024-01-15"
}
```

**Response:**
```json
{
  "id": "animal_id",
  "name": "Goat Batch A",
  "animalTypeId": "animal_type_id",
  "description": "Young goats for breeding",
  "userId": "user_id",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

### 4. Error Handling

If record creation fails, the API returns:

```json
{
  "animal": { /* animal data */ },
  "warning": "Animal created but purchase record could not be created",
  "recordError": "Error message"
}
```

## Service Functions

### `createAnimalPurchaseRecord(data, userId)`

Creates a purchase record for an animal with the following parameters:

- `animalId`: ID of the created animal
- `animalName`: Name of the animal
- `animalTypeId`: ID of the animal type
- `userId`: ID of the user
- `purchasePrice`: Price per unit (optional)
- `quantity`: Number of animals (optional, defaults to 1)
- `note`: Additional notes (optional)
- `purchaseDate`: Date of purchase (optional, defaults to current date)

### `getAnimalRecords(animalId)`

Retrieves all records associated with a specific animal.

## Database Schema

The record is created in the `records` table with:

- `categoryId`: Points to the "Animal Purchase" category
- `unitPrice`: Price per animal
- `quantity`: Number of animals
- `note`: Description of the purchase
- `date`: Purchase date
- `animalId`: Foreign key to the animal
- `userId`: Foreign key to the user

## UI Integration

The add animal modal includes:

1. **Animal Information**: Name, type, description
2. **Purchase Information**: Date, quantity, unit price, total price, notes
3. **Dynamic Animal Types**: Uses animal types from the database
4. **Validation**: Required fields validation
5. **Error Handling**: Displays errors if record creation fails

## Benefits

1. **Automatic Tracking**: Every animal purchase is automatically recorded
2. **Financial Transparency**: Complete audit trail of animal acquisitions
3. **Data Integrity**: Ensures all animals have associated purchase records
4. **User Experience**: Seamless workflow for adding animals with purchase details
5. **Error Resilience**: Animal creation succeeds even if record creation fails

## Future Enhancements

1. **Transaction Rollback**: Rollback animal creation if record creation fails
2. **Bulk Operations**: Support for creating multiple animals at once
3. **Advanced Pricing**: Support for different pricing models
4. **Vendor Tracking**: Track vendor/seller information
5. **Payment Terms**: Support for payment schedules and terms 