# Program Upgrade Guide

Managing Solana program deployments and upgrades.

## Initial Deployment

```bash
# Build the program
anchor build

# Deploy to mainnet
anchor deploy --provider.cluster mainnet

# Record the program ID
anchor keys list
```

## Upgrade Authority

### Option 1: Keep Upgradeable (recommended for early projects)
- You can fix bugs and add features
- Users must trust your authority wallet
- Use a multisig (Squads) for the authority

### Option 2: Freeze (immutable)
- No one can change the program ever
- Maximum trustlessness
- Only do this when the program is battle-tested

```bash
# To freeze (IRREVERSIBLE):
solana program set-upgrade-authority <PROGRAM_ID> --final
```

### Option 3: Transfer Authority
- Move authority to a DAO or multisig
- Good for decentralization roadmaps

```bash
solana program set-upgrade-authority <PROGRAM_ID> \
  --new-upgrade-authority <NEW_AUTHORITY>
```

## Upgrade Process

```bash
# 1. Build new version
anchor build

# 2. Verify the build (compare hashes)
sha256sum target/deploy/my_program.so

# 3. Deploy upgrade
anchor upgrade <PROGRAM_ID> --program-filepath target/deploy/my_program.so

# 4. Verify on-chain
solana program show <PROGRAM_ID>
```

## State Migration (when account structures change)

If your upgrade changes account data layouts, existing accounts need migration.

### Strategy 1: Version field (recommended)

```rust
#[account]
pub struct VaultV2 {
    pub version: u8,       // Add version field (always first)
    pub authority: Pubkey,
    pub balance: u64,
    pub new_field: u64,    // New field in V2
}

// Migration instruction
pub fn migrate_vault(ctx: Context<MigrateVault>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    require!(vault.version == 1, ErrorCode::AlreadyMigrated);
    vault.version = 2;
    vault.new_field = 0; // Default value for new field
    Ok(())
}
```

### Strategy 2: Realloc (resize existing accounts)

```rust
#[derive(Accounts)]
pub struct MigrateAccount<'info> {
    #[account(
        mut,
        realloc = 8 + VaultV2::LEN,
        realloc::payer = authority,
        realloc::zero = true,  // Zero new bytes
    )]
    pub vault: Account<'info, VaultV2>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
```

### Strategy 3: Dual-read (backward compatible)

```rust
// Support reading both V1 and V2 account formats
pub fn process(account_data: &[u8]) -> Result<VaultState> {
    if account_data.len() == V1_SIZE {
        let v1 = VaultV1::try_deserialize(account_data)?;
        Ok(VaultState::from_v1(v1))
    } else {
        let v2 = VaultV2::try_deserialize(account_data)?;
        Ok(VaultState::from_v2(v2))
    }
}
```

### Migration checklist

1. Deploy new program with migration instruction
2. Call migration instruction on all existing accounts (batch with lookup tables)
3. Monitor: verify all accounts migrated (`solana program show` + account scan)
4. Optional: remove V1 support in next upgrade

## Rollback Plan

```bash
# If upgrade goes wrong and program is still upgradeable:

# 1. Save the broken program binary for investigation
solana program dump <PROGRAM_ID> broken-version.so

# 2. Redeploy the previous version
anchor upgrade <PROGRAM_ID> --program-filepath previous-version.so

# 3. Verify rollback
solana program show <PROGRAM_ID>
```

If the program is frozen: **you cannot rollback**. This is why freezing should only happen after extensive testing.

## Safety Rules

1. **Always test the upgrade on devnet first** with the same process
2. **Back up the current program binary** before upgrading: `solana program dump <PROGRAM_ID> backup.so`
3. **Account migration**: If you changed account structures, write a migration instruction
4. **Notify users**: If the upgrade changes behavior, communicate before deploying
5. **Monitor after upgrade**: Watch for errors in the first hour using `solana logs <PROGRAM_ID>`
6. **Keep upgrade authority for 3+ months** before considering freeze
7. **Use Squads multisig** for upgrade authority on programs with >$10k TVL
