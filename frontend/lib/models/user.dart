class User {
  final String id;
  final String email;
  final String username;
  final String? displayName;
  final String createdAt;
  final String updatedAt;

  const User({
    required this.id,
    required this.email,
    required this.username,
    this.displayName,
    required this.createdAt,
    required this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      username: json['username'] as String,
      displayName: json['displayName'] as String?,
      createdAt: json['createdAt'] as String,
      updatedAt: json['updatedAt'] as String,
    );
  }
}
