const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Video = require('../models/Video');
const ApiError = require('../utils/ApiError');

class SubscriptionService {
  /**
   * Toggle subscription to a channel
   */
  async toggleSubscription(subscriberId, channelId) {
    if (subscriberId.toString() === channelId.toString()) {
      throw new ApiError(400, 'You cannot subscribe to your own channel');
    }

    const channel = await User.findById(channelId);
    if (!channel) {
      throw new ApiError(404, 'Channel not found');
    }

    const existingSubscription = await Subscription.findOne({
      subscriber: subscriberId,
      channel: channelId,
    });

    let isSubscribed = false;

    if (existingSubscription) {
      // Unsubscribe
      await Subscription.findByIdAndDelete(existingSubscription._id);

      channel.subscribersCount = Math.max(0, channel.subscribersCount - 1);
      await channel.save();

      await User.findByIdAndUpdate(subscriberId, {
        $inc: { subscribedToCount: -1 },
      });

      isSubscribed = false;
    } else {
      // Subscribe
      await Subscription.create({
        subscriber: subscriberId,
        channel: channelId,
      });

      channel.subscribersCount += 1;
      await channel.save();

      await User.findByIdAndUpdate(subscriberId, {
        $inc: { subscribedToCount: 1 },
      });

      isSubscribed = true;
    }

    return {
      isSubscribed,
      subscribersCount: channel.subscribersCount,
    };
  }

  /**
   * Check if user is subscribed to channel
   */
  async getSubscriptionStatus(subscriberId, channelId) {
    const channel = await User.findById(channelId).select('subscribersCount');
    if (!channel) {
      throw new ApiError(404, 'Channel not found');
    }

    let isSubscribed = false;
    if (subscriberId) {
      const sub = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId,
      });
      isSubscribed = !!sub;
    }

    return {
      isSubscribed,
      subscribersCount: channel.subscribersCount,
    };
  }

  /**
   * Get personalized feed of videos from channels user is subscribed to
   */
  async getSubscribedFeed(subscriberId, { page = 1, limit = 12 }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const subscriptions = await Subscription.find({ subscriber: subscriberId }).select('channel');
    const channelIds = subscriptions.map((s) => s.channel);

    if (channelIds.length === 0) {
      return {
        videos: [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
        },
      };
    }

    const query = {
      owner: { $in: channelIds },
      visibility: 'public',
    };

    const [videos, total] = await Promise.all([
      Video.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('owner', 'username avatar subscribersCount')
        .lean(),
      Video.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return {
      videos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
      },
    };
  }

  /**
   * Get list of all channels user is subscribed to
   */
  async getSubscribedChannels(subscriberId) {
    const subscriptions = await Subscription.find({ subscriber: subscriberId })
      .populate('channel', 'username avatar description subscribersCount')
      .sort({ createdAt: -1 });

    return subscriptions.map((s) => s.channel);
  }
}

module.exports = new SubscriptionService();
