const UPDATE_COMPANY_REQUIRED_FIELDS = [
  'name',
  'service',
  'capital',
  'logoUrl',
  'deletedAt',
];

const UPDATE_ACCOUNT_REQUIRED_FIELDS = [
  'username',
  'email',
  'avatarUrl',
  'role',
  'deletedAt',
];

const pickRequiredFields = <T>(
  data: Record<string, any>,
  fields: string[],
): Partial<T> =>
  fields.reduce((acc, field) => {
    if (field in data) {
      acc[field] = data[field];
    }
    return acc;
  }, {} as Partial<T>);

export {
  pickRequiredFields,
  UPDATE_COMPANY_REQUIRED_FIELDS,
  UPDATE_ACCOUNT_REQUIRED_FIELDS,
};
