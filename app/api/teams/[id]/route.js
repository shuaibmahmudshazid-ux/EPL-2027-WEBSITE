import connectToDatabase from "../../../../lib/mongodb";
import Team from "../../../../models/team";
import Player from "../../../../models/player";
import TeamKey from "../../../../models/teamKey";
import AuctionState from "../../../../models/auctionState";
import { getSession } from "../../../../lib/adminAuth";

export const runtime = "nodejs";

// GET /api/teams/[id]
export const GET = async (_request, { params }) => {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authenticated." }, { status: 401 });

  const { id } = await params;
  await connectToDatabase();

  const team = await Team.findById(id)
    .populate("players", "fullName playerId categories soldPrice basePrice photoUrl session auctionStatus tier registrationNumber phone email")
    .lean();

  if (!team) {
    return Response.json({ error: "Team not found." }, { status: 404 });
  }

  return Response.json({ team });
};

// DELETE /api/teams/[id]
export const DELETE = async (_request, { params }) => {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authenticated." }, { status: 401 });

  const { id } = await params;
  await connectToDatabase();

  const team = await Team.findById(id);
  if (!team) {
    return Response.json({ error: "Team not found." }, { status: 404 });
  }

  // 1. Unassign all players currently in this team
  await Player.updateMany(
    { team: team._id },
    {
      $set: {
        team: null,
        soldPrice: null,
        auctionStatus: "upcoming",
      },
    }
  );

  // 2. Free up any TeamKey claimed by this team
  await TeamKey.updateMany(
    { team: team._id },
    { $set: { status: "free", team: null } }
  );
  if (team.uniqueKey) {
    await TeamKey.updateMany(
      { key: team.uniqueKey },
      { $set: { status: "free", team: null } }
    );
  }

  // 3. Clean up AuctionState if this team was leading bidder or in active queue
  await AuctionState.updateMany(
    { currentBidderTeam: team._id },
    {
      $set: {
        currentBidderTeam: null,
        currentBidderTeamName: null,
        currentBidderTeamLogo: null,
      },
    }
  );

  // 4. Delete the team
  await Team.findByIdAndDelete(team._id);

  return Response.json({
    message: `Team "${team.name}" and its associations were deleted successfully.`,
  });
};

// PATCH /api/teams/[id] - Manage squad (add/remove/delete player) or update team details
export const PATCH = async (request, { params }) => {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authenticated." }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { action, playerId, soldPrice, name, status, managers, logoUrl } = body;

  await connectToDatabase();
  const team = await Team.findById(id);
  if (!team) {
    return Response.json({ error: "Team not found." }, { status: 404 });
  }

  // Action: Add an existing player to this team
  if (action === "add_player") {
    if (!playerId) {
      return Response.json({ error: "Player ID is required." }, { status: 400 });
    }

    const player = await Player.findById(playerId);
    if (!player) {
      return Response.json({ error: "Player not found." }, { status: 404 });
    }

    // If player belonged to another team, remove from that team
    if (player.team && player.team.toString() !== team._id.toString()) {
      await Team.findByIdAndUpdate(player.team, {
        $pull: { players: player._id },
      });
    }

    const price = soldPrice !== undefined ? Number(soldPrice) : (player.soldPrice || player.basePrice || 0);

    player.team = team._id;
    player.soldPrice = price;
    player.auctionStatus = "sold";
    await player.save();

    await Team.findByIdAndUpdate(team._id, {
      $addToSet: { players: player._id },
    });

    const updatedTeam = await Team.findById(team._id)
      .populate("players", "fullName playerId categories soldPrice basePrice photoUrl session auctionStatus tier registrationNumber")
      .lean();

    return Response.json({
      message: `${player.fullName} added to ${team.name}.`,
      team: updatedTeam,
      player,
    });
  }

  // Action: Remove player from this team (unassign)
  if (action === "remove_player") {
    if (!playerId) {
      return Response.json({ error: "Player ID is required." }, { status: 400 });
    }

    const player = await Player.findById(playerId);
    if (player) {
      player.team = null;
      player.soldPrice = null;
      player.auctionStatus = "upcoming";
      await player.save();
    }

    await Team.findByIdAndUpdate(team._id, {
      $pull: { players: playerId },
    });

    const updatedTeam = await Team.findById(team._id)
      .populate("players", "fullName playerId categories soldPrice basePrice photoUrl session auctionStatus tier registrationNumber")
      .lean();

    return Response.json({
      message: `${player?.fullName || "Player"} removed from squad.`,
      team: updatedTeam,
    });
  }

  // Action: Permanently delete player from system
  if (action === "delete_player") {
    if (!playerId) {
      return Response.json({ error: "Player ID is required." }, { status: 400 });
    }

    const player = await Player.findByIdAndDelete(playerId);
    await Team.updateMany(
      { players: playerId },
      { $pull: { players: playerId } }
    );

    const updatedTeam = await Team.findById(team._id)
      .populate("players", "fullName playerId categories soldPrice basePrice photoUrl session auctionStatus tier registrationNumber")
      .lean();

    return Response.json({
      message: `${player?.fullName || "Player"} permanently deleted.`,
      team: updatedTeam,
    });
  }

  if (name) team.name = name.trim();
  if (status && ["active", "inactive"].includes(status)) team.status = status;
  if (Array.isArray(managers)) {
    team.managers = managers
      .filter((m) => m && (m.name?.trim() || m.phone?.trim() || m.email?.trim()))
      .map((m) => ({
        name: (m.name || "").trim(),
        phone: (m.phone || "").replace(/\D/g, ""),
        email: (m.email || "").trim().toLowerCase(),
      }));
  }
  if (logoUrl !== undefined) team.logoUrl = logoUrl;

  await team.save();

  const updatedTeam = await Team.findById(team._id)
    .populate("players", "fullName playerId categories soldPrice basePrice photoUrl session auctionStatus tier registrationNumber")
    .lean();

  return Response.json({
    message: "Team updated successfully.",
    team: updatedTeam,
  });
};
