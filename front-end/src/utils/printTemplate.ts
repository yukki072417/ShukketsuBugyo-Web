export const loadTemplate = async (templateName: string): Promise<string> => {
  try {
    const response = await fetch(`/assets/templates/${templateName}.html`);
    return await response.text();
  } catch (error) {
    console.error(`Failed to load template: ${templateName}`, error);
    throw error;
  }
};

export const replaceTemplateVariables = (template: string, variables: Record<string, string>): string => {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });
  return result;
};

export const printHTML = (content: string): void => {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      
      // Close window after print dialog
      printWindow.onafterprint = () => {
        printWindow.close();
      };
      
      // Fallback: close after 2 seconds if still open
      setTimeout(() => {
        if (!printWindow.closed) {
          printWindow.close();
        }
      }, 2000);
    };
  }
};