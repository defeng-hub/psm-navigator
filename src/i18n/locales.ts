export const translations = {
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      clear: 'Clear',
      loading: 'Loading...',
      confirmDelete: 'Are you sure you want to delete this item?',
      confirmClearHistory: 'Are you sure you want to clear search history?',
      successImport: 'Successfully imported {count} PSMs.',
      confirmOverwrite: 'This will overwrite your current configuration. Are you sure?',
      importFailed: 'Failed to import configuration: Invalid JSON file',
      allDataCleared: 'All data cleared successfully.',
      confirmClearAll: 'Type "delete all" to confirm clearing ALL data (platforms, variables, history). This cannot be undone.',
      confirmationFailed: 'Confirmation failed. Data was not deleted.'
    },
    popup: {
      title: 'PSM Navigator',
      placeholder: 'Enter PSM (e.g. video.feed.app)',
      recent: 'Recent',
      noPlatforms: 'No platforms enabled.',
      configure: 'Configure platforms',
      settings: 'Settings'
    },
    options: {
      title: 'PSM Navigator Settings',
      subtitle: 'Configure your platforms and navigation preferences',
      clearSearchHistory: 'Clear Search History',
      clearAllData: 'Clear All Data',
      tabs: {
        platforms: 'Platforms',
        variables: 'Variables',
        data: 'Data Management'
      },
      platforms: {
        title: 'Platforms',
        add: 'Add Platform',
        new: 'New Platform',
        namePlaceholder: 'Name (e.g. GitLab)',
        urlPlaceholder: 'URL Template (e.g. https://gitlab.com/search?q={psm})',
        categoryPlaceholder: 'Category (Optional)',
        availableVars: 'Available variables:',
        save: 'Save Platform',
        disabled: 'Disabled'
      },
      variables: {
        title: 'Custom Variables',
        add: 'Add Variable',
        new: 'New Variable',
        namePlaceholder: 'Variable Name (e.g. VRegion)',
        valuesPlaceholder: 'Values (comma separated, e.g. sg, va, mumbai)',
        defaultPlaceholder: 'Default Value (Optional)',
        save: 'Save Variable',
        default: 'Default:'
      },
      data: {
        title: 'PSM Data Import',
        total: 'Total Imported:',
        description: 'Paste a list of PSMs (one per line) to enable fuzzy search and autocomplete in the main popup.',
        placeholder: 'video.feed.app\nvideo.feed.server\n...',
        update: 'Update PSM List',
        backupTitle: 'Configuration Backup',
        backupDesc: 'Export your full configuration (platforms, variables, history, PSMs) to a JSON file, or restore from a backup.',
        export: 'Export Config',
        import: 'Import Config'
      }
    }
  },
  cn: {
    common: {
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      clear: '清空',
      loading: '加载中...',
      confirmDelete: '确认要删除此项吗？',
      confirmClearHistory: '确认要清空搜索历史吗？',
      successImport: '成功导入 {count} 个 PSM。',
      confirmOverwrite: '这将覆盖您当前的配置，确定吗？',
      importFailed: '导入失败：无效的 JSON 文件',
      allDataCleared: '所有数据已成功清除。',
      confirmClearAll: '输入 "delete all" 以确认清除所有数据（平台、变量、历史记录）。此操作不可撤销。',
      confirmationFailed: '确认失败，数据未删除。'
    },
    popup: {
      title: 'PSM 导航助手',
      placeholder: '输入 PSM (如 video.feed.app)',
      recent: '最近访问',
      noPlatforms: '未启用任何平台。',
      configure: '配置平台',
      settings: '设置'
    },
    options: {
      title: 'PSM 导航助手设置',
      subtitle: '配置您的目标平台和导航偏好',
      clearSearchHistory: '清空搜索历史',
      clearAllData: '清空所有数据',
      tabs: {
        platforms: '平台列表',
        variables: '变量配置',
        data: '数据管理'
      },
      platforms: {
        title: '平台列表',
        add: '添加平台',
        new: '新建平台',
        namePlaceholder: '名称 (如 GitLab)',
        urlPlaceholder: 'URL 模板 (如 https://gitlab.com/search?q={psm})',
        categoryPlaceholder: '分类 (可选)',
        availableVars: '可用变量:',
        save: '保存平台',
        disabled: '已禁用'
      },
      variables: {
        title: '自定义变量',
        add: '添加变量',
        new: '新建变量',
        namePlaceholder: '变量名 (如 VRegion)',
        valuesPlaceholder: '变量值 (名称 - 值)',
        defaultPlaceholder: '默认值 (可选)',
        save: '保存变量',
        default: '默认:'
      },
      data: {
        title: 'PSM 数据导入',
        total: '已导入总数:',
        description: '粘贴 PSM 列表（每行一个）以启用模糊搜索和自动补全功能。',
        placeholder: 'video.feed.app\nvideo.feed.server\n...',
        update: '更新 PSM 列表',
        backupTitle: '配置备份',
        backupDesc: '将完整配置（平台、变量、历史、PSM）导出为 JSON 文件，或从备份恢复。',
        export: '导出配置',
        import: '导入配置'
      }
    }
  }
};

export type Language = 'en' | 'cn';
export type TranslationKey = string; // Simplified for now, can be improved with recursive types
