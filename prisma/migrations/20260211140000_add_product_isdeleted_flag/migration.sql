-- Migration script to add isDeleted column to Product table for soft delete
ALTER TABLE "Product" ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;