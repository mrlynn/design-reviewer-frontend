// services/templateStore.js
import { z } from 'zod';
import YAML from 'yaml';
import fs from 'fs/promises';
import path from 'path';

const TEMPLATE_DIR = path.join(process.cwd(), 'templates');

export class TemplateStore {
  static async initialize() {
    try {
      await fs.mkdir(TEMPLATE_DIR, { recursive: true });
    } catch (error) {
      console.error('Failed to create template directory:', error);
      throw error;
    }
  }

  static async listTemplates() {
    try {
      const files = await fs.readdir(TEMPLATE_DIR);
      const templates = [];
      
      for (const file of files) {
        if (file.endsWith('.yaml') || file.endsWith('.yml')) {
          const content = await fs.readFile(path.join(TEMPLATE_DIR, file), 'utf-8');
          const template = YAML.parse(content);
          templates.push(template);
        }
      }
      
      return templates;
    } catch (error) {
      console.error('Failed to list templates:', error);
      throw error;
    }
  }

  static async getTemplate(templateId) {
    try {
      const filePath = path.join(TEMPLATE_DIR, `${templateId}.yaml`);
      const content = await fs.readFile(filePath, 'utf-8');
      return YAML.parse(content);
    } catch (error) {
      console.error(`Failed to get template ${templateId}:`, error);
      throw error;
    }
  }

  static async saveTemplate(template) {
    try {
      const filePath = path.join(TEMPLATE_DIR, `${template.id}.yaml`);
      const content = YAML.stringify(template);
      await fs.writeFile(filePath, content, 'utf-8');
      return template;
    } catch (error) {
      console.error('Failed to save template:', error);
      throw error;
    }
  }
}