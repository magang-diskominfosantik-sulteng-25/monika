<?php

use App\Models\User;

test('user seeder creates default accounts', function () {
    // Run the seeder
    $this->seed(\Database\Seeders\UserSeeder::class);

    // Check if operator account exists
    $operator = User::where('email', 'operator@diskominfo.sultengprov.go.id')->first();
    expect($operator)->not->toBeNull();
    expect($operator->name)->toBe('Operator');
});

test('authenticated user can access users page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/users');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('Users/Index'));
});

test('can create new user account', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/users', [
        'name' => 'Test Operator',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertRedirect();

    expect(User::where('email', 'test@example.com')->exists())->toBeTrue();
});

test('can update user account', function () {
    $user = User::factory()->create();
    $targetUser = User::factory()->create([
        'name' => 'Old Name',
        'email' => 'old@example.com',
    ]);

    $response = $this->actingAs($user)->put("/users/{$targetUser->id}", [
        'name' => 'New Name',
        'email' => 'new@example.com',
    ]);

    $response->assertRedirect();

    $targetUser->refresh();
    expect($targetUser->name)->toBe('New Name');
    expect($targetUser->email)->toBe('new@example.com');
});

test('can delete user account', function () {
    $user = User::factory()->create();
    $targetUser = User::factory()->create();

    $response = $this->actingAs($user)->delete("/users/{$targetUser->id}");

    $response->assertRedirect();

    expect(User::find($targetUser->id))->toBeNull();
});

test('guest cannot access users page', function () {
    $response = $this->get('/users');

    $response->assertRedirect('/login');
});

test('cannot create user with duplicate email', function () {
    $user = User::factory()->create();
    $existingUser = User::factory()->create(['email' => 'duplicate@example.com']);

    $response = $this->actingAs($user)->post('/users', [
        'name' => 'Test User',
        'email' => 'duplicate@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertSessionHasErrors('email');
});

test('password must be confirmed when creating user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/users', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'differentpassword',
    ]);

    $response->assertSessionHasErrors('password');
});
