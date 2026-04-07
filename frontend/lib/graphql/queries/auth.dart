const _userFields = '''
  id email username displayName createdAt updatedAt
''';

const signupMutation =
    '''
  mutation Signup(\$email: String!, \$password: String!, \$username: String!) {
    signup(email: \$email, password: \$password, username: \$username) {
      token
      user { $_userFields }
    }
  }
''';

const loginMutation =
    '''
  mutation Login(\$email: String!, \$password: String!) {
    login(email: \$email, password: \$password) {
      token
      user { $_userFields }
    }
  }
''';

const meQuery =
    '''
  query Me {
    me { $_userFields }
  }
''';
